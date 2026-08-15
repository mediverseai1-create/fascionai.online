import type { InventorySnapshotRow, SaleRow } from './types';
import { isWithinRange } from './dates';

export function calculateSellThrough(unitsSold: number, quantityOnHand: number): number | null {
  const denominator = unitsSold + quantityOnHand;
  if (denominator === 0) return null;
  return (unitsSold / denominator) * 100;
}

export function getLatestInventoryByProduct(
  snapshots: InventorySnapshotRow[]
): Map<string, InventorySnapshotRow> {
  const latest = new Map<string, InventorySnapshotRow>();
  for (const snapshot of snapshots) {
    const current = latest.get(snapshot.product_id);
    if (!current || new Date(snapshot.as_of_date).getTime() > new Date(current.as_of_date).getTime()) {
      latest.set(snapshot.product_id, snapshot);
    }
  }
  return latest;
}

export function sumUnitsSoldInRange(
  sales: SaleRow[],
  productId: string,
  startDate: Date,
  endDate: Date
): number {
  let total = 0;
  for (const sale of sales) {
    if (sale.product_id !== productId) continue;
    const soldAt = new Date(sale.sold_at);
    if (isWithinRange(soldAt, startDate, endDate)) {
      total += sale.quantity;
    }
  }
  return total;
}
