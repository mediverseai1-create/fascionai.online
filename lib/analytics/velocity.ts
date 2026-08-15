import type { SaleRow } from './types';
import { addDays } from './dates';
import { sumUnitsSoldInRange } from './sellThrough';

export function calculateAvgDailySalesRate(
  sales: SaleRow[],
  productId: string,
  windowDays: number,
  asOfDate: Date = new Date()
): number {
  if (windowDays <= 0) return 0;
  const startDate = addDays(asOfDate, -windowDays);
  const unitsSold = sumUnitsSoldInRange(sales, productId, startDate, asOfDate);
  return unitsSold / windowDays;
}

export function calculateDaysOfStock(quantityOnHand: number, avgDailyRate: number): number | null {
  if (avgDailyRate === 0) return null; // no recent sales activity to project from
  return quantityOnHand / avgDailyRate;
}

export function estimateStockoutDate(
  quantityOnHand: number,
  avgDailyRate: number,
  asOfDate: Date = new Date()
): Date | null {
  const daysOfStock = calculateDaysOfStock(quantityOnHand, avgDailyRate);
  if (daysOfStock === null) return null;
  return addDays(asOfDate, daysOfStock);
}
