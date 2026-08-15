import { requireOrgContext } from "@/lib/org";
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
  isStockoutRisk,
  isOverstock,
  addDays,
} from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { formatCurrency, formatNumber } from "@/lib/utils";
import Link from "next/link";

export default async function OverviewPage() {
  const org = await requireOrgContext();
  const [products, sales, snapshots] = await Promise.all([
    getProducts(org.organizationId),
    getSales(org.organizationId),
    getLatestInventorySnapshots(org.organizationId),
  ]);

  if (products.length === 0) {
    return (
      <div>
        <PageHeader title="Overview" subtitle={org.organizationName} />
        <EmptyState
          title="No data yet"
          description="Import your sales and inventory data to see revenue, sell-through, and reorder recommendations here."
        />
      </div>
    );
  }

  const now = new Date();
  const thirtyDaysAgo = addDays(now, -30);
  const recentSales = sales.filter(
    (s) => new Date(s.sold_at) >= thirtyDaysAgo
  );
  const totalRevenue30d = recentSales.reduce((sum, s) => sum + s.revenue, 0);
  const totalUnits30d = recentSales.reduce((sum, s) => sum + s.quantity, 0);
  const orderCount30d = recentSales.length;
  const avgOrderValue =
    orderCount30d > 0 ? totalRevenue30d / orderCount30d : null;

  const topProducts = rankProductsByRevenue(products, sales, thirtyDaysAgo, now);
  const bestSeller = topProducts[0] ?? null;

  const latestInventory = getLatestInventoryByProduct(snapshots);
  let stockoutRiskCount = 0;
  let overstockCount = 0;

  for (const product of products) {
    const snapshot = latestInventory.get(product.id);
    if (!snapshot) continue;
    const avgDailyRate = calculateAvgDailySalesRate(sales, product.id, 30, now);
    const daysOfStock = calculateDaysOfStock(
      snapshot.quantity_on_hand,
      avgDailyRate
    );
    if (isStockoutRisk(daysOfStock, snapshot.lead_time_days ?? 14)) {
      stockoutRiskCount++;
    }
    if (isOverstock(daysOfStock)) {
      overstockCount++;
    }
  }

  return (
    <div>
      <PageHeader title="Overview" subtitle={org.organizationName} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiTile
          label="Revenue, last 30 days"
          value={formatCurrency(totalRevenue30d, org.currency)}
        />
        <KpiTile label="Units sold, last 30 days" value={formatNumber(totalUnits30d)} />
        <KpiTile
          label="Avg order value"
          value={avgOrderValue !== null ? formatCurrency(avgOrderValue, org.currency) : "—"}
        />
        <KpiTile
          label="Needs attention"
          value={String(stockoutRiskCount + overstockCount)}
          tone={stockoutRiskCount + overstockCount > 0 ? "risk" : "neutral"}
          hint={`${stockoutRiskCount} stockout risk · ${overstockCount} overstock`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Eyebrow>Best sellers, last 30 days</Eyebrow>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted py-4">
              No sales recorded in the last 30 days.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {topProducts.slice(0, 5).map(({ product, unitsSold, revenue }) => (
                <li
                  key={product.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.style_name}
                    </p>
                    <p className="text-xs text-muted font-mono mt-0.5">
                      {product.sku} · {unitsSold} units
                    </p>
                  </div>
                  <span className="text-sm font-semibold shrink-0">
                    {formatCurrency(revenue, org.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {bestSeller && (
            <Link
              href="/dashboard/products"
              className="text-sm text-wine font-semibold mt-2 inline-block"
            >
              See all products →
            </Link>
          )}
        </Card>

        <Card className="p-6">
          <Eyebrow>Attention needed</Eyebrow>
          {stockoutRiskCount + overstockCount === 0 ? (
            <p className="text-sm text-muted py-4">
              Nothing needs action right now.
            </p>
          ) : (
            <div className="space-y-3 py-2">
              {stockoutRiskCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Products at risk of stockout</span>
                  <Tag variant="risk">{stockoutRiskCount}</Tag>
                </div>
              )}
              {overstockCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Products overstocked</span>
                  <Tag variant="watch">{overstockCount}</Tag>
                </div>
              )}
            </div>
          )}
          <Link
            href="/dashboard/attention"
            className="text-sm text-wine font-semibold mt-2 inline-block"
          >
            Review attention list →
          </Link>
        </Card>

        <div className="lg:col-span-2">
          <AiInsightCard />
        </div>
      </div>
    </div>
  );
}
