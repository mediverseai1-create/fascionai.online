// Default safety factor of 1.3 adds a 30% buffer over the lead-time demand
// forecast to absorb demand variability during the reorder lead time.
const DEFAULT_SAFETY_FACTOR = 1.3;
const DEFAULT_OVERSTOCK_THRESHOLD_DAYS = 90;

export function calculateReorderQuantity(
  avgDailyRate: number,
  leadTimeDays: number,
  quantityOnHand: number,
  safetyFactor: number = DEFAULT_SAFETY_FACTOR
): number {
  const targetStock = Math.round(avgDailyRate * leadTimeDays * safetyFactor);
  return Math.max(0, targetStock - quantityOnHand);
}

export function isOverstock(
  daysOfStock: number | null,
  thresholdDays: number = DEFAULT_OVERSTOCK_THRESHOLD_DAYS
): boolean {
  if (daysOfStock === null) return false;
  return daysOfStock > thresholdDays;
}

export function isStockoutRisk(daysOfStock: number | null, leadTimeDays: number): boolean {
  if (daysOfStock === null) return false;
  return daysOfStock <= leadTimeDays;
}
