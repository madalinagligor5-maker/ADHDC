import { APP_IDS, MAX_DAY_MINUTES, type AppId, type UsageMap } from './apps';

export type EntryError = 'invalid' | 'negative' | 'over-day';

/** Converts the hours/minutes form fields to minutes. */
export function toMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

/**
 * Validates a manual entry for one app. Re-entering an app replaces its value,
 * so the day total is computed without the app's previous value.
 */
export function validateEntry(usage: UsageMap, app: AppId, minutes: number): EntryError | null {
  if (!Number.isFinite(minutes) || !Number.isInteger(minutes)) return 'invalid';
  if (minutes < 0) return 'negative';
  const others = APP_IDS.filter((id) => id !== app).reduce((sum, id) => sum + (usage[id] ?? 0), 0);
  if (others + minutes > MAX_DAY_MINUTES) return 'over-day';
  return null;
}

/** Remaining minutes that can still be logged for `app` on that day. */
export function maxMinutesFor(usage: UsageMap, app: AppId): number {
  const others = APP_IDS.filter((id) => id !== app).reduce((sum, id) => sum + (usage[id] ?? 0), 0);
  return Math.max(0, MAX_DAY_MINUTES - others);
}

/** Clamps automatic readings into a valid day (the OS can report overlapping sessions). */
export function normalizeAutoUsage(usage: UsageMap): UsageMap {
  const result: UsageMap = {};
  let total = 0;
  for (const id of APP_IDS) {
    const value = usage[id];
    if (value === undefined || !Number.isFinite(value)) continue;
    const minutes = Math.min(Math.max(0, Math.round(value)), MAX_DAY_MINUTES - total);
    result[id] = minutes;
    total += minutes;
  }
  return result;
}
