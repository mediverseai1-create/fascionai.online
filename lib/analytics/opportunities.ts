import type { InventorySnapshotRow, ProductRow, SaleRow } from './types';
import { addDays, daysBetween } from './dates';
import { getLatestInventoryByProduct, sumUnitsSoldInRange } from './sellThrough';
import { calculateAvgDailySalesRate, calculateDaysOfStock } from './velocity';
import { calculatePeriodOverPeriodChange } from './trends';

const VELOCITY_WINDOW_DAYS = 14;
const VELOCITY_CHANGE_THRESHOLD_PERCENT = 20;
const REVENUE_WINDOW_DAYS = 90;
const DEAD_STOCK_WINDOW_DAYS = 60;
const STOCK_RATE_WINDOW_DAYS = 30;
// A quartile split isn't meaningful below this many revenue-generating products.
const MIN_PRODUCTS_FOR_QUARTILE = 4;

export type Opportunity =
  | {
      kind: 'rising_velocity';
      product: ProductRow;
      recentRate: number;
      priorRate: number;
      changePercent: number;
    }
  | {
      kind: 'declining_velocity';
      product: ProductRow;
      recentRate: number;
      priorRate: number;
      changePercent: number;
    }
  | {
      kind: 'high_value_low_stock';
      product: ProductRow;
      revenue90d: number;
      daysOfStock: number;
    }
  | {
      kind: 'dead_stock';
      product: ProductRow;
      quantityOnHand: number;
      daysSinceLastSale: number;
    };

interface FindOpportunitiesInput {
  products: ProductRow[];
  sales: SaleRow[];
  snapshots: InventorySnapshotRow[];
  asOfDate?: Date;
}

// Nearest-rank 75th percentile over a sorted-ascending numeric array.
function percentile75(sortedAscending: number[]): number {
  const index = Math.max(0, Math.ceil(0.75 * sortedAscending.length) - 1);
  return sortedAscending[index];
}

function sumRevenueInRange(sales: SaleRow[], productId: string, startDate: Date, endDate: Date): number {
  let total = 0;
  for (const sale of sales) {
    if (sale.product_id !== productId) continue;
    const soldAt = new Date(sale.sold_at);
    if (soldAt.getTime() >= startDate.getTime() && soldAt.getTime() <= endDate.getTime()) {
      total += sale.revenue;
    }
  }
  return total;
}

function findLastSaleDate(sales: SaleRow[], productId: string, onOrBefore: Date): Date | null {
  let latest: Date | null = null;
  for (const sale of sales) {
    if (sale.product_id !== productId) continue;
    const soldAt = new Date(sale.sold_at);
    if (soldAt.getTime() > onOrBefore.getTime()) continue;
    if (!latest || soldAt.getTime() > latest.getTime()) latest = soldAt;
  }
  return latest;
}

function findVelocityOpportunities(
  products: ProductRow[],
  sales: SaleRow[],
  asOfDate: Date
): Array<Extract<Opportunity, { kind: 'rising_velocity' | 'declining_velocity' }>> {
  const opportunities: Array<Extract<Opportunity, { kind: 'rising_velocity' | 'declining_velocity' }>> = [];
  const priorWindowEnd = addDays(asOfDate, -VELOCITY_WINDOW_DAYS);

  for (const product of products) {
    const recentRate = calculateAvgDailySalesRate(sales, product.id, VELOCITY_WINDOW_DAYS, asOfDate);
    const priorRate = calculateAvgDailySalesRate(sales, product.id, VELOCITY_WINDOW_DAYS, priorWindowEnd);

    if (priorRate <= 0) continue; // can't compute a meaningful percent change from zero

    const changePercent = calculatePeriodOverPeriodChange(recentRate, priorRate);
    if (changePercent === null) continue;

    if (changePercent > VELOCITY_CHANGE_THRESHOLD_PERCENT) {
      opportunities.push({ kind: 'rising_velocity', product, recentRate, priorRate, changePercent });
    } else if (changePercent < -VELOCITY_CHANGE_THRESHOLD_PERCENT) {
      opportunities.push({ kind: 'declining_velocity', product, recentRate, priorRate, changePercent });
    }
  }

  return opportunities;
}

function findHighValueLowStockOpportunities(
  products: ProductRow[],
  sales: SaleRow[],
  latestInventory: Map<string, InventorySnapshotRow>,
  asOfDate: Date
): Array<Extract<Opportunity, { kind: 'high_value_low_stock' }>> {
  const revenueStart = addDays(asOfDate, -REVENUE_WINDOW_DAYS);
  const revenueByProduct = new Map<string, number>();

  for (const product of products) {
    const revenue90d = sumRevenueInRange(sales, product.id, revenueStart, asOfDate);
    if (revenue90d > 0) revenueByProduct.set(product.id, revenue90d);
  }

  const revenueValues = Array.from(revenueByProduct.values()).sort((a, b) => a - b);
  if (revenueValues.length < MIN_PRODUCTS_FOR_QUARTILE) return [];

  const topQuartileThreshold = percentile75(revenueValues);
  const opportunities: Array<Extract<Opportunity, { kind: 'high_value_low_stock' }>> = [];

  for (const product of products) {
    const revenue90d = revenueByProduct.get(product.id);
    if (revenue90d === undefined || revenue90d < topQuartileThreshold) continue;

    const snapshot = latestInventory.get(product.id);
    if (!snapshot || snapshot.lead_time_days === null) continue; // no lead time data to compare against

    const avgDailyRate = calculateAvgDailySalesRate(sales, product.id, STOCK_RATE_WINDOW_DAYS, asOfDate);
    const daysOfStock = calculateDaysOfStock(snapshot.quantity_on_hand, avgDailyRate);
    if (daysOfStock === null) continue;

    if (daysOfStock < snapshot.lead_time_days) {
      opportunities.push({ kind: 'high_value_low_stock', product, revenue90d, daysOfStock });
    }
  }

  return opportunities;
}

function findDeadStockOpportunities(
  products: ProductRow[],
  sales: SaleRow[],
  latestInventory: Map<string, InventorySnapshotRow>,
  asOfDate: Date
): Array<Extract<Opportunity, { kind: 'dead_stock' }>> {
  const opportunities: Array<Extract<Opportunity, { kind: 'dead_stock' }>> = [];
  const windowStart = addDays(asOfDate, -DEAD_STOCK_WINDOW_DAYS);

  for (const product of products) {
    const snapshot = latestInventory.get(product.id);
    if (!snapshot || snapshot.quantity_on_hand <= 0) continue;

    const unitsSoldRecently = sumUnitsSoldInRange(sales, product.id, windowStart, asOfDate);
    if (unitsSoldRecently > 0) continue;

    const lastSaleDate = findLastSaleDate(sales, product.id, asOfDate);
    if (!lastSaleDate) continue; // never sold — no basis to report "days since last sale"

    opportunities.push({
      kind: 'dead_stock',
      product,
      quantityOnHand: snapshot.quantity_on_hand,
      daysSinceLastSale: daysBetween(lastSaleDate, asOfDate),
    });
  }

  return opportunities;
}

export function findOpportunities(input: FindOpportunitiesInput): Opportunity[] {
  const { products, sales, snapshots } = input;
  const asOfDate = input.asOfDate ?? new Date();
  const latestInventory = getLatestInventoryByProduct(snapshots);

  return [
    ...findVelocityOpportunities(products, sales, asOfDate),
    ...findHighValueLowStockOpportunities(products, sales, latestInventory, asOfDate),
    ...findDeadStockOpportunities(products, sales, latestInventory, asOfDate),
  ];
}
