import { requireOrgContext } from "@/lib/org";
import { getProducts, getSales } from "@/lib/data/inventory";
import {
  buildRevenueTimeSeries,
  rankProductsByRevenue,
  addDays,
} from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState, InlineEmptyNote } from "@/components/dashboard/EmptyState";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const org = await requireOrgContext();
  const { range } = await searchParams;
  const windowDays = range === "90" ? 90 : range === "7" ? 7 : 30;

  const [products, sales] = await Promise.all([
    getProducts(org.organizationId),
    getSales(org.organizationId),
  ]);

  if (products.length === 0) {
    return (
      <div>
        <PageHeader title="Sales & revenue" />
        <EmptyState
          title="No sales data yet"
          description="Import your sales history to see revenue trends and category breakdowns."
        />
      </div>
    );
  }

  const now = new Date();
  const startDate = addDays(now, -windowDays);
  const periodSales = sales.filter((s) => new Date(s.sold_at) >= startDate);
  const totalRevenue = periodSales.reduce((sum, s) => sum + s.revenue, 0);
  const totalUnits = periodSales.reduce((sum, s) => sum + s.quantity, 0);
  const orderCount = periodSales.length;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : null;

  const bucket = windowDays > 30 ? "week" : "day";
  const series = buildRevenueTimeSeries(sales, startDate, now, bucket);

  const byCategory = new Map<string, number>();
  const rankedProducts = rankProductsByRevenue(products, sales, startDate, now);
  for (const { product, revenue } of rankedProducts) {
    const key = product.category ?? "Uncategorized";
    byCategory.set(key, (byCategory.get(key) ?? 0) + revenue);
  }
  const categoryBreakdown = Array.from(byCategory.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div>
      <PageHeader title="Sales & revenue" />

      <div className="flex gap-2 mb-6">
        {[
          { label: "7 days", value: "7" },
          { label: "30 days", value: "30" },
          { label: "90 days", value: "90" },
        ].map((opt) => (
          <a
            key={opt.value}
            href={`/dashboard/sales?range=${opt.value}`}
            className={`px-3 py-1.5 rounded-[var(--radius)] text-[13px] font-medium border ${
              windowDays === Number(opt.value)
                ? "bg-ink text-white border-ink"
                : "border-line text-ink hover:border-ink"
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KpiTile label="Revenue" value={formatCurrency(totalRevenue, org.currency)} />
        <KpiTile label="Units sold" value={formatNumber(totalUnits)} />
        <KpiTile
          label="Avg order value"
          value={avgOrderValue !== null ? formatCurrency(avgOrderValue, org.currency) : "—"}
        />
      </div>

      <Card className="p-6 mb-6">
        <Eyebrow>Revenue over time</Eyebrow>
        {series.length === 0 ? (
          <InlineEmptyNote>No sales recorded in this period.</InlineEmptyNote>
        ) : (
          <RevenueChart data={series} currency={org.currency} />
        )}
      </Card>

      <Card className="p-6">
        <Eyebrow>Revenue by category</Eyebrow>
        {categoryBreakdown.length === 0 ? (
          <InlineEmptyNote>No sales recorded in this period.</InlineEmptyNote>
        ) : (
          <ul className="divide-y divide-line">
            {categoryBreakdown.map(([category, revenue]) => (
              <li key={category} className="py-3 flex items-center justify-between">
                <span className="text-sm">{category}</span>
                <span className="text-sm font-semibold">
                  {formatCurrency(revenue, org.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
