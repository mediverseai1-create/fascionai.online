import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getProducts,
  getSales,
  getLatestInventorySnapshots,
} from "@/lib/data/inventory";
import {
  rankProductsByRevenue,
  getLatestInventoryByProduct,
  calculateAvgDailySalesRate,
  calculateDaysOfStock,
  findOpportunities,
  addDays,
} from "@/lib/analytics";
import { rowsToCsv } from "@/lib/reports/csv";

const REPORT_TYPES = ["revenue", "products", "opportunities"] as const;
type ReportType = (typeof REPORT_TYPES)[number];

export async function GET(request: Request) {
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
    return NextResponse.json({ error: "No organization found" }, { status: 403 });
  }

  const organizationId = membership.organization_id;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ReportType | null;

  if (!type || !REPORT_TYPES.includes(type)) {
    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }

  const [products, sales, snapshots] = await Promise.all([
    getProducts(organizationId),
    getSales(organizationId),
    getLatestInventorySnapshots(organizationId),
  ]);

  const now = new Date();
  let csv: string;
  let filename: string;

  if (type === "revenue") {
    const start = addDays(now, -90);
    const ranked = rankProductsByRevenue(products, sales, start, now);
    csv = rowsToCsv(
      ["sku", "style_name", "units_sold", "revenue"],
      ranked.map((r) => [r.product.sku, r.product.style_name, r.unitsSold, r.revenue.toFixed(2)])
    );
    filename = "facsion-ai-revenue-summary.csv";
  } else if (type === "products") {
    const latestInventory = getLatestInventoryByProduct(snapshots);
    csv = rowsToCsv(
      ["sku", "style_name", "category", "quantity_on_hand", "avg_daily_rate_30d", "days_of_stock"],
      products.map((p) => {
        const snapshot = latestInventory.get(p.id);
        const rate = calculateAvgDailySalesRate(sales, p.id, 30, now);
        const days = snapshot ? calculateDaysOfStock(snapshot.quantity_on_hand, rate) : null;
        return [
          p.sku,
          p.style_name,
          p.category ?? "",
          snapshot?.quantity_on_hand ?? "",
          rate.toFixed(2),
          days === null ? "" : days.toFixed(1),
        ];
      })
    );
    filename = "facsion-ai-product-performance.csv";
  } else {
    const opportunities = findOpportunities({ products, sales, snapshots, asOfDate: now });
    csv = rowsToCsv(
      ["kind", "sku", "style_name", "detail"],
      opportunities.map((op) => {
        const detail =
          op.kind === "rising_velocity" || op.kind === "declining_velocity"
            ? `${op.changePercent.toFixed(1)}% change (${op.priorRate.toFixed(2)} -> ${op.recentRate.toFixed(2)} units/day)`
            : op.kind === "high_value_low_stock"
            ? `${op.daysOfStock.toFixed(1)} days of stock, $${op.revenue90d.toFixed(2)} revenue in 90d`
            : `${op.quantityOnHand} units on hand, ${op.daysSinceLastSale} days since last sale`;
        return [op.kind, op.product.sku, op.product.style_name, detail];
      })
    );
    filename = "facsion-ai-opportunities.csv";
  }

  await supabase.from("reports").insert({
    organization_id: organizationId,
    created_by: user.id,
    type,
    params: {},
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
