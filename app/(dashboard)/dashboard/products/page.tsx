import { requireOrgContext } from "@/lib/org";
import {
  getProducts,
  getSales,
  getLatestInventorySnapshots,
} from "@/lib/data/inventory";
import { rankProductsByRevenue, findSlowMovers, addDays } from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState, InlineEmptyNote } from "@/components/dashboard/EmptyState";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default async function ProductsPage() {
  const org = await requireOrgContext();
  const [products, sales, snapshots] = await Promise.all([
    getProducts(org.organizationId),
    getSales(org.organizationId),
    getLatestInventorySnapshots(org.organizationId),
  ]);

  if (products.length === 0) {
    return (
      <div>
        <PageHeader title="Products" />
        <EmptyState
          title="No products yet"
          description="Import your product catalog and sales history to see performance rankings."
        />
      </div>
    );
  }

  const now = new Date();
  const ninetyDaysAgo = addDays(now, -90);
  const topProducts = rankProductsByRevenue(products, sales, ninetyDaysAgo, now);
  const slowMovers = findSlowMovers(products, sales, snapshots, 30, now).filter(
    (row) => row.daysOfStock === null || row.daysOfStock > 60
  );

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${formatNumber(products.length)} products in catalog`}
      />

      <Card className="p-6 mb-6">
        <Eyebrow>Best performers, last 90 days</Eyebrow>
        {topProducts.length === 0 ? (
          <InlineEmptyNote>No sales recorded in the last 90 days.</InlineEmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-mono uppercase tracking-wide text-muted border-b border-line">
                  <th className="py-2 pr-4 font-medium">Style</th>
                  <th className="py-2 pr-4 font-medium">Units sold</th>
                  <th className="py-2 pr-4 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.slice(0, 15).map(({ product, unitsSold, revenue }) => (
                  <tr key={product.id} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{product.style_name}</p>
                      <p className="text-xs text-muted font-mono">
                        {product.sku}
                        {product.color ? ` · ${product.color}` : ""}
                        {product.size ? ` · ${product.size}` : ""}
                      </p>
                    </td>
                    <td className="py-3 pr-4">{formatNumber(unitsSold)}</td>
                    <td className="py-3 pr-4 font-semibold">
                      {formatCurrency(revenue, org.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <Eyebrow>Slow movers — 60+ days of stock at current pace</Eyebrow>
        {slowMovers.length === 0 ? (
          <InlineEmptyNote>
            No products are moving unusually slowly right now.
          </InlineEmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-mono uppercase tracking-wide text-muted border-b border-line">
                  <th className="py-2 pr-4 font-medium">Style</th>
                  <th className="py-2 pr-4 font-medium">Units on hand</th>
                  <th className="py-2 pr-4 font-medium">Units sold, 30d</th>
                  <th className="py-2 pr-4 font-medium">Days of stock</th>
                </tr>
              </thead>
              <tbody>
                {slowMovers.slice(0, 15).map((row) => (
                  <tr key={row.product.id} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{row.product.style_name}</p>
                      <p className="text-xs text-muted font-mono">{row.product.sku}</p>
                    </td>
                    <td className="py-3 pr-4">{formatNumber(row.quantityOnHand)}</td>
                    <td className="py-3 pr-4">{formatNumber(row.unitsSold)}</td>
                    <td className="py-3 pr-4">
                      {row.daysOfStock === null
                        ? "No recent sales"
                        : `${Math.round(row.daysOfStock)} days`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
