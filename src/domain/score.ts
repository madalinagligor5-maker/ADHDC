/**
 * Fade Score: progress towards the user's own daily limit. It is not a medical
 * or cognitive measurement.
 *
 *   score = round(100 × min(1, limit / max(1, usage)))
 *
 * `null` means "no data", which is different from an explicit 0 minutes.
 */
export function computeScore(usageMin: number | null, limitMin: number): number | null {
  if (!isValidLimit(limitMin)) throw new RangeError(`Daily limit must be a positive number, got ${limitMin}`);
  if (usageMin === null) return null;
  if (!Number.isFinite(usageMin) || usageMin < 0) throw new RangeError(`Usage must be ≥ 0, got ${usageMin}`);
  return Math.round(100 * Math.min(1, limitMin / Math.max(1, usageMin)));
}

export function isValidLimit(limitMin: number): boolean {
  return Number.isFinite(limitMin) && limitMin > 0;
}

/** Minutes over the limit (0 when within it). */
export function minutesOverLimit(usageMin: number, limitMin: number): number {
  return Math.max(0, usageMin - limitMin);
}

export const LIMIT_SUGGESTIONS = [30, 60, 90, 120] as const;
export const MIN_LIMIT = 5;
export const MAX_LIMIT = 24 * 60;
