import type { InventorySnapshotRow, ProductRow, SaleRow } from './types';
import { isWithinRange } from './dates';
import { getLatestInventoryByProduct } from './sellThrough';
import { calculateAvgDailySalesRate, calculateDaysOfStock } from './velocity';

interface ProductSalesTotals {
  unitsSold: number;
  revenue: number;
}

function sumSalesByProductInRange(
  sales: SaleRow[],
  startDate: Date,
  endDate: Date
): Map<string, ProductSalesTotals> {
  const totals = new Map<string, ProductSalesTotals>();
  for (const sale of sales) {
    const soldAt = new Date(sale.sold_at);
    if (!isWithinRange(soldAt, startDate, endDate)) continue;
    const existing = totals.get(sale.product_id) ?? { unitsSold: 0, revenue: 0 };
    existing.unitsSold += sale.quantity;
    existing.revenue += sale.revenue;
    totals.set(sale.product_id, existing);
  }
  return totals;
}

export function rankProductsByRevenue(
  products: ProductRow[],
  sales: SaleRow[],
  startDate: Date,
  endDate: Date
): Array<{ product: ProductRow; unitsSold: number; revenue: number }> {
  const totals = sumSalesByProductInRange(sales, startDate, endDate);
  const ranked: Array<{ product: ProductRow; unitsSold: number; revenue: number }> = [];

  for (const product of products) {
    const totalsForProduct = totals.get(product.id);
    if (!totalsForProduct || totalsForProduct.unitsSold === 0) continue;
    ranked.push({ product, unitsSold: totalsForProduct.unitsSold, revenue: totalsForProduct.revenue });
  }

  ranked.sort((a, b) => b.revenue - a.revenue);
  return ranked;
}

export function findSlowMovers(
  products: ProductRow[],
  sales: SaleRow[],
  snapshots: InventorySnapshotRow[],
  windowDays: number,
  asOfDate: Date = new Date()
): Array<{ product: ProductRow; unitsSold: number; quantityOnHand: number; daysOfStock: number | null }> {
  const latestInventory = getLatestInventoryByProduct(snapshots);
  const startDate = new Date(asOfDate.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const totals = sumSalesByProductInRange(sales, startDate, asOfDate);

  const result: Array<{
    product: ProductRow;
    unitsSold: number;
    quantityOnHand: number;
    daysOfStock: number | null;
  }> = [];

  for (const product of products) {
    const snapshot = latestInventory.get(product.id);
    if (!snapshot) continue; // no inventory data for this product; don't fabricate

    const unitsSold = totals.get(product.id)?.unitsSold ?? 0;
    const avgDailyRate = calculateAvgDailySalesRate(sales, product.id, windowDays, asOfDate);
    const daysOfStock = calculateDaysOfStock(snapshot.quantity_on_hand, avgDailyRate);

    result.push({ product, unitsSold, quantityOnHand: snapshot.quantity_on_hand, daysOfStock });
  }

  // Slowest movers first: unknown/no-velocity (null) days-of-stock is the most
  // concerning (zero recent sales with stock sitting on hand), then descending
  // by days-of-stock (the longer stock will last at current pace, the slower it moves).
  result.sort((a, b) => {
    if (a.daysOfStock === null && b.daysOfStock === null) return b.quantityOnHand - a.quantityOnHand;
    if (a.daysOfStock === null) return -1;
    if (b.daysOfStock === null) return 1;
    return b.daysOfStock - a.daysOfStock;
  });

  return result;
}
