const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / MS_PER_DAY;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

// Truncates to the start of the UTC day (used for bucketing time series).
export function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// ISO week start (Monday), UTC-based.
export function startOfWeekUTC(date: Date): Date {
  const d = startOfDayUTC(date);
  const day = d.getUTCDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  return addDays(d, -diffToMonday);
}
