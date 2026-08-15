import { requireOrgContext } from "@/lib/org";
import {
  getProducts,
  getSales,
  getLatestInventorySnapshots,
} from "@/lib/data/inventory";
import {
  getLatestInventoryByProduct,
  calculateAvgDailySalesRate,
  calculateDaysOfStock,
  isStockoutRisk,
  isOverstock,
  calculateReorderQuantity,
} from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { InlineEmptyNote } from "@/components/dashboard/EmptyState";
import { formatNumber } from "@/lib/utils";

export default async function AttentionPage() {
  const org = await requireOrgContext();
  const [products, sales, snapshots] = await Promise.all([
    getProducts(org.organizationId),
    getSales(org.organizationId),
    getLatestInventorySnapshots(org.organizationId),
  ]);

  if (products.length === 0) {
    return (
      <div>
        <PageHeader title="Attention needed" />
        <EmptyState
          title="No data yet"
          description="Import your sales and inventory data to see which styles need a reorder, markdown, or transfer decision."
        />
      </div>
    );
  }

  const now = new Date();
  const latestInventory = getLatestInventoryByProduct(snapshots);

  const stockoutRisks: Array<{
    productId: string;
    styleName: string;
    sku: string;
    daysOfStock: number;
    reorderQty: number;
  }> = [];
  const overstocks: Array<{
    productId: string;
    styleName: string;
    sku: string;
    daysOfStock: number;
    quantityOnHand: number;
  }> = [];

  for (const product of products) {
    const snapshot = latestInventory.get(product.id);
    if (!snapshot) continue;

    const leadTime = snapshot.lead_time_days ?? 14;
    const avgDailyRate = calculateAvgDailySalesRate(sales, product.id, 30, now);
    const daysOfStock = calculateDaysOfStock(snapshot.quantity_on_hand, avgDailyRate);

    if (isStockoutRisk(daysOfStock, leadTime) && daysOfStock !== null) {
      stockoutRisks.push({
        productId: product.id,
        styleName: product.style_name,
        sku: product.sku,
        daysOfStock,
        reorderQty: calculateReorderQuantity(
          avgDailyRate,
          leadTime,
          snapshot.quantity_on_hand
        ),
      });
    }

    if (isOverstock(daysOfStock) && daysOfStock !== null) {
      overstocks.push({
        productId: product.id,
        styleName: product.style_name,
        sku: product.sku,
        daysOfStock,
        quantityOnHand: snapshot.quantity_on_hand,
      });
    }
  }

  stockoutRisks.sort((a, b) => a.daysOfStock - b.daysOfStock);
  overstocks.sort((a, b) => b.daysOfStock - a.daysOfStock);

  return (
    <div>
      <PageHeader
        title="Attention needed"
        subtitle="Based on the last 30 days of sales velocity against current stock on hand."
      />

      <Card className="p-6 mb-6">
        <Eyebrow>Stockout risk — reorder soon</Eyebrow>
        {stockoutRisks.length === 0 ? (
          <InlineEmptyNote>
            No products are projected to run out before a reorder could arrive.
          </InlineEmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-mono uppercase tracking-wide text-muted border-b border-line">
                  <th className="py-2 pr-4 font-medium">Style</th>
                  <th className="py-2 pr-4 font-medium">Stockout in</th>
                  <th className="py-2 pr-4 font-medium">Suggested reorder</th>
                </tr>
              </thead>
              <tbody>
                {stockoutRisks.map((row) => (
                  <tr key={row.productId} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{row.styleName}</p>
                      <p className="text-xs text-muted font-mono">{row.sku}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Tag variant="risk">{Math.max(0, Math.round(row.daysOfStock))} days</Tag>
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      +{formatNumber(row.reorderQty)} units
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <Eyebrow>Overstock — consider a markdown or transfer</Eyebrow>
        {overstocks.length === 0 ? (
          <InlineEmptyNote>No products are currently overstocked.</InlineEmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-mono uppercase tracking-wide text-muted border-b border-line">
                  <th className="py-2 pr-4 font-medium">Style</th>
                  <th className="py-2 pr-4 font-medium">Units on hand</th>
                  <th className="py-2 pr-4 font-medium">Days of stock</th>
                </tr>
              </thead>
              <tbody>
                {overstocks.map((row) => (
                  <tr key={row.productId} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{row.styleName}</p>
                      <p className="text-xs text-muted font-mono">{row.sku}</p>
                    </td>
                    <td className="py-3 pr-4">{formatNumber(row.quantityOnHand)}</td>
                    <td className="py-3 pr-4">
                      <Tag variant="watch">{Math.round(row.daysOfStock)} days</Tag>
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
