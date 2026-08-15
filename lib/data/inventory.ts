import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  ProductRow,
  SaleRow,
  InventorySnapshotRow,
} from "@/lib/analytics/types";

export async function getProducts(organizationId: string): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, sku, style_name, category, color, size, cost, price")
    .eq("organization_id", organizationId)
    .order("style_name");

  if (error) throw error;
  return data ?? [];
}

export async function getSales(
  organizationId: string,
  options?: { since?: Date }
): Promise<SaleRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("sales_transactions")
    .select("id, product_id, quantity, revenue, sold_at")
    .eq("organization_id", organizationId)
    .order("sold_at", { ascending: false });

  if (options?.since) {
    query = query.gte("sold_at", options.since.toISOString().slice(0, 10));
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getLatestInventorySnapshots(
  organizationId: string
): Promise<InventorySnapshotRow[]> {
  const supabase = await createClient();
  // Pull recent snapshots and let the analytics layer pick the latest per
  // product — simplest correct approach without a DB-side "latest per
  // group" query, and snapshot volume per org is small enough for this
  // to be cheap.
  const { data, error } = await supabase
    .from("inventory_snapshots")
    .select("id, product_id, quantity_on_hand, as_of_date, lead_time_days")
    .eq("organization_id", organizationId)
    .order("as_of_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getImportHistory(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("csv_imports")
    .select("id, filename, row_count, status, error_message, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function hasAnyData(organizationId: string): Promise<boolean> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (error) throw error;
  return (count ?? 0) > 0;
}
