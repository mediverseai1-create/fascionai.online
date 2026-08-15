import { requireOrgContext } from "@/lib/org";
import { getProducts, getSales } from "@/lib/data/inventory";
import { deriveTrend, addDays, type Trend } from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState, InlineEmptyNote } from "@/components/dashboard/EmptyState";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { ProductRow, SaleRow } from "@/lib/analytics/types";

function sumRevenue(sales: SaleRow[], start: Date, end: Date) {
  return sales
    .filter((s) => {
      const d = new Date(s.sold_at);
      return d >= start && d <= end;
    })
    .reduce((sum, s) => sum + s.revenue, 0);
}

function TrendTag({ trend }: { trend: Trend | null }) {
  if (!trend) return <span className="text-xs text-muted">Not enough history</span>;
  if (trend.direction === "flat") return <Tag variant="watch">No change</Tag>;
  const label =
    trend.changePercent !== null
      ? formatPercent(trend.changePercent, 0)
      : trend.direction === "up"
      ? "Up"
      : "Down";
  return (
    <Tag variant={trend.direction === "up" ? "good" : "risk"}>{label}</Tag>
  );
}

export default async function TrendsPage() {
  const org = await requireOrgContext();
  const [products, sales] = await Promise.all([
    getProducts(org.organizationId),
    getSales(org.organizationId),
  ]);

  if (products.length === 0) {
    return (
      <div>
        <PageHeader title="Trends" />
        <EmptyState
          title="No data yet"
          description="Import at least two periods of sales history to see period-over-period trends."
        />
      </div>
    );
  }

  const now = new Date();
  const currentStart = addDays(now, -30);
  const priorStart = addDays(now, -60);
  const priorEnd = addDays(now, -30);

  const earliestSale = sales.reduce<Date | null>((earliest, s) => {
    const d = new Date(s.sold_at);
    return !earliest || d < earliest ? d : earliest;
  }, null);
  const hasPreviousData = earliestSale !== null && earliestSale <= priorStart;

  const currentRevenue = sumRevenue(sales, currentStart, now);
  const priorRevenue = sumRevenue(sales, priorStart, priorEnd);
  const revenueTrend = deriveTrend(currentRevenue, priorRevenue, hasPreviousData);

  const byCategory = new Map<string, ProductRow[]>();
  for (const product of products) {
    const key = product.category ?? "Uncategorized";
    byCategory.set(key, [...(byCategory.get(key) ?? []), product]);
  }

  const categoryTrends = Array.from(byCategory.entries()).map(
    ([category, categoryProducts]) => {
      const ids = new Set(categoryProducts.map((p) => p.id));
      const categorySales = sales.filter((s) => ids.has(s.product_id));
      const current = sumRevenue(categorySales, currentStart, now);
      const prior = sumRevenue(categorySales, priorStart, priorEnd);
      return {
        category,
        current,
        trend: deriveTrend(current, prior, hasPreviousData),
      };
    }
  );
  categoryTrends.sort((a, b) => b.current - a.current);

  return (
    <div>
      <PageHeader
        title="Trends"
        subtitle="Comparing the last 30 days against the 30 days before that."
      />

      <Card className="p-6 mb-6">
        <Eyebrow>Overall revenue</Eyebrow>
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-[28px]">
            {formatCurrency(currentRevenue, org.currency)}
          </span>
          <TrendTag trend={revenueTrend} />
        </div>
        <p className="text-xs text-muted mt-1">
          Previous 30 days: {formatCurrency(priorRevenue, org.currency)}
        </p>
      </Card>

      <Card className="p-6">
        <Eyebrow>By category</Eyebrow>
        {categoryTrends.length === 0 ? (
          <InlineEmptyNote>No category data available.</InlineEmptyNote>
        ) : (
          <ul className="divide-y divide-line">
            {categoryTrends.map((row) => (
              <li key={row.category} className="py-3 flex items-center justify-between gap-3">
                <span className="text-sm">{row.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {formatCurrency(row.current, org.currency)}
                  </span>
                  <TrendTag trend={row.trend} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
