import type { SaleRow } from './types';
import { isWithinRange, startOfDayUTC, startOfWeekUTC } from './dates';

export type Trend = {
  direction: 'up' | 'down' | 'flat';
  changePercent: number | null;
};

export function calculatePeriodOverPeriodChange(
  currentValue: number,
  previousValue: number
): number | null {
  if (previousValue === 0) return null; // no meaningful percent change from a zero base
  return ((currentValue - previousValue) / previousValue) * 100;
}

export function buildRevenueTimeSeries(
  sales: SaleRow[],
  startDate: Date,
  endDate: Date,
  bucket: 'day' | 'week'
): Array<{ date: string; revenue: number; units: number }> {
  const buckets = new Map<string, { revenue: number; units: number }>();

  for (const sale of sales) {
    const soldAt = new Date(sale.sold_at);
    if (!isWithinRange(soldAt, startDate, endDate)) continue;

    const bucketStart = bucket === 'day' ? startOfDayUTC(soldAt) : startOfWeekUTC(soldAt);
    const key = bucketStart.toISOString().slice(0, 10);

    const existing = buckets.get(key) ?? { revenue: 0, units: 0 };
    existing.revenue += sale.revenue;
    existing.units += sale.quantity;
    buckets.set(key, existing);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, totals]) => ({ date, revenue: totals.revenue, units: totals.units }));
}

// hasPreviousData distinguishes "previous period had zero sales" (a real, computable
// trend) from "we have no data for the previous period at all" (trend is unknown).
export function deriveTrend(
  currentPeriodValue: number,
  previousPeriodValue: number,
  hasPreviousData: boolean
): Trend | null {
  if (!hasPreviousData) return null;

  const changePercent = calculatePeriodOverPeriodChange(currentPeriodValue, previousPeriodValue);

  if (currentPeriodValue === previousPeriodValue) {
    return { direction: 'flat', changePercent: changePercent ?? 0 };
  }

  const direction = currentPeriodValue > previousPeriodValue ? 'up' : 'down';
  return { direction, changePercent };
}
