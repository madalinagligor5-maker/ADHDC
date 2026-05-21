import { addDays, startOfDay, toISODate } from '@/utils/date';
import type { HabitLog } from './types';

/** Set of completed ISO dates for one habit. */
export function doneDates(logs: HabitLog[], habitId: string): Set<string> {
  const set = new Set<string>();
  for (const log of logs) {
    if (log.habitId === habitId) set.add(log.date);
  }
  return set;
}

export function isDone(done: Set<string>, date: Date): boolean {
  return done.has(toISODate(date));
}

/**
 * "Don't break the chain" streak: consecutive completed days ending today.
 * If today isn't done yet, the streak counts up to yesterday so it isn't
 * considered broken until a full day passes (never punishing mid-day).
 */
export function currentStreak(done: Set<string>, today = new Date()): number {
  const start = startOfDay(today);
  let cursor = done.has(toISODate(start)) ? start : addDays(start, -1);
  let streak = 0;
  while (done.has(toISODate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
