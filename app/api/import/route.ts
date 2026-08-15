import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { csvImportRowSchema } from "@/lib/validations/csvImport";
import { z } from "zod";

const requestSchema = z.object({
  filename: z.string(),
  rows: z.array(csvImportRowSchema).min(1).max(5000),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { error: "No organization found for this account" },
      { status: 403 }
    );
  }

  const organizationId = membership.organization_id;

  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid import payload", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { filename, rows } = parsed.data;
  const today = new Date().toISOString().slice(0, 10);

  // Import record starts as "processing"; flipped to completed/failed below.
  const { data: importRecord, error: importInsertError } = await supabase
    .from("csv_imports")
    .insert({
      organization_id: organizationId,
      uploaded_by: user.id,
      filename,
      row_count: rows.length,
      status: "processing",
    })
    .select()
    .single();

  if (importInsertError || !importRecord) {
    return NextResponse.json(
      { error: importInsertError?.message ?? "Could not start import" },
      { status: 500 }
    );
  }

  try {
    // 1. Upsert products by (organization_id, sku). Last row for a given
    // SKU in this file wins for catalog fields — acceptable for MVP since
    // catalog data rarely conflicts within a single export.
    const productsBySku = new Map<string, (typeof rows)[number]>();
    for (const row of rows) productsBySku.set(row.sku, row);

    const productUpserts = Array.from(productsBySku.values()).map((row) => ({
      organization_id: organizationId,
      sku: row.sku,
      style_name: row.style_name,
      category: row.category || null,
      color: row.color || null,
      size: row.size || null,
      cost: row.cost ?? null,
      price: row.price ?? null,
    }));

    const { data: upsertedProducts, error: productError } = await supabase
      .from("products")
      .upsert(productUpserts, { onConflict: "organization_id,sku" })
      .select("id, sku");

    if (productError) throw new Error(productError.message);

    const productIdBySku = new Map(
      (upsertedProducts ?? []).map((p) => [p.sku, p.id])
    );

    // 2. Insert sales transactions (one per CSV row).
    const salesInserts = rows.map((row) => ({
      organization_id: organizationId,
      product_id: productIdBySku.get(row.sku)!,
      quantity: row.quantity_sold,
      revenue: row.revenue,
      sold_at: row.sold_at,
    }));

    const { error: salesError } = await supabase
      .from("sales_transactions")
      .insert(salesInserts);

    if (salesError) throw new Error(salesError.message);

    // 3. Upsert today's inventory snapshot per product (last row per SKU
    // in this file determines quantity_on_hand / lead_time_days).
    const snapshotsBySku = new Map<string, (typeof rows)[number]>();
    for (const row of rows) snapshotsBySku.set(row.sku, row);

    const snapshotUpserts = Array.from(snapshotsBySku.entries()).map(
      ([sku, row]) => ({
        organization_id: organizationId,
        product_id: productIdBySku.get(sku)!,
        quantity_on_hand: row.quantity_on_hand,
        as_of_date: today,
        lead_time_days: row.lead_time_days,
      })
    );

    const { error: snapshotError } = await supabase
      .from("inventory_snapshots")
      .upsert(snapshotUpserts, {
        onConflict: "organization_id,product_id,as_of_date",
      });

    if (snapshotError) throw new Error(snapshotError.message);

    await supabase
      .from("csv_imports")
      .update({ status: "completed" })
      .eq("id", importRecord.id);

    return NextResponse.json({
      success: true,
      productsImported: productUpserts.length,
      salesImported: salesInserts.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    await supabase
      .from("csv_imports")
      .update({ status: "failed", error_message: message })
      .eq("id", importRecord.id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
