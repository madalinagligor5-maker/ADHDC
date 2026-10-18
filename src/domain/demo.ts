import type { UsageMap } from './apps';
import { addDays, fromDateKey, type DateKey } from './date';
import type { PauseSession } from './pause';
import type { DayRecord } from './types';

/**
 * Fixed sample data for "Explorează un exemplu". It is never written to the
 * user's storage and every screen showing it is labelled "Date demonstrative".
 */
const DEMO_USAGE: UsageMap[] = [
  { tiktok: 48, instagram: 31, youtube: 17 },
  { tiktok: 35, instagram: 22, youtube: 9 },
  { tiktok: 26, instagram: 18, youtube: 12 },
  { tiktok: 41, instagram: 25, youtube: 20 },
  { tiktok: 22, instagram: 14, youtube: 8 },
  { tiktok: 19, instagram: 16, youtube: 6 },
  { tiktok: 21, instagram: 12, youtube: 9 },
];

export const DEMO_LIMIT = 60;

export function buildDemoDays(today: DateKey): Record<DateKey, DayRecord> {
  const days: Record<DateKey, DayRecord> = {};
  DEMO_USAGE.forEach((usage, index) => {
    const date = addDays(today, index - (DEMO_USAGE.length - 1));
    days[date] = {
      date,
      usage,
      source: 'manual',
      limitMin: DEMO_LIMIT,
      challengeId: null,
      challengeDone: index % 2 === 0 && index < DEMO_USAGE.length - 1,
      challengeVerified: false,
    };
  });
  return days;
}

export function buildDemoPauses(today: DateKey): PauseSession[] {
  return [3, 2, 1].map((daysAgo) => {
    // 18:00 local time on that day.
    const startedAt = fromDateKey(addDays(today, -daysAgo)).getTime() + 18 * 3_600_000;
    return {
      id: `demo-${today}-${daysAgo}`,
      startedAt,
      endedAt: startedAt + 20 * 60_000,
      plannedMin: 20,
      elapsedMs: 20 * 60_000,
      completed: true,
    };
  });
}
