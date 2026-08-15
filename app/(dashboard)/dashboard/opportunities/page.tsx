import { requireOrgContext } from "@/lib/org";
import {
  getProducts,
  getSales,
  getLatestInventorySnapshots,
} from "@/lib/data/inventory";
import { findOpportunities, type Opportunity } from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";

const KIND_LABEL: Record<Opportunity["kind"], string> = {
  rising_velocity: "Rising demand",
  declining_velocity: "Declining demand",
  high_value_low_stock: "High value, low stock",
  dead_stock: "Dead stock",
};

const KIND_TAG_VARIANT: Record<Opportunity["kind"], "good" | "risk" | "watch"> = {
  rising_velocity: "good",
  declining_velocity: "risk",
  high_value_low_stock: "risk",
  dead_stock: "watch",
};

function describeOpportunity(op: Opportunity, currency: string): string {
  switch (op.kind) {
    case "rising_velocity":
      return `Selling ${formatPercent(op.changePercent, 0)} faster over the last 14 days (${op.recentRate.toFixed(1)}/day vs ${op.priorRate.toFixed(1)}/day). Consider reordering ahead of demand.`;
    case "declining_velocity":
      return `Selling ${formatPercent(Math.abs(op.changePercent), 0)} slower over the last 14 days (${op.recentRate.toFixed(1)}/day vs ${op.priorRate.toFixed(1)}/day).`;
    case "high_value_low_stock":
      return `${formatCurrency(op.revenue90d, currency)} in revenue over 90 days, but only ${Math.round(op.daysOfStock)} days of stock left — below lead time.`;
    case "dead_stock":
      return `${formatNumber(op.quantityOnHand)} units on hand, no sales in ${op.daysSinceLastSale} days.`;
  }
}

export default async function OpportunitiesPage() {
  const org = await requireOrgContext();
  const [products, sales, snapshots] = await Promise.all([
    getProducts(org.organizationId),
    getSales(org.organizationId),
    getLatestInventorySnapshots(org.organizationId),
  ]);

  if (products.length === 0) {
    return (
      <div>
        <PageHeader title="Opportunities" />
        <EmptyState
          title="No data yet"
          description="Import your sales and inventory data to surface reorder, retention, and markdown opportunities."
        />
      </div>
    );
  }

  const opportunities = findOpportunities({ products, sales, snapshots });

  return (
    <div>
      <PageHeader
        title="Opportunities"
        subtitle="Derived directly from your sales velocity and inventory data — every item below shows the numbers behind it."
      />

      {opportunities.length === 0 ? (
        <EmptyState
          title="No opportunities surfaced yet"
          description="This usually means there isn't enough sales history yet, or nothing currently stands out. Check back after a few more weeks of data."
          actionLabel="Import more data"
        />
      ) : (
        <div className="space-y-3">
          {opportunities.map((op, i) => (
            <Card key={i} className="p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Tag variant={KIND_TAG_VARIANT[op.kind]}>{KIND_LABEL[op.kind]}</Tag>
                  <span className="text-sm font-medium">{op.product.style_name}</span>
                  <span className="text-xs text-muted font-mono">{op.product.sku}</span>
                </div>
                <p className="text-sm text-muted">
                  {describeOpportunity(op, org.currency)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
