import { addDays, isSameDay, startOfDay, toISODate } from '@/utils/date';
import type { MoodEntry } from './types';

export interface DailyMood {
  date: Date;
  /** Average mood level for the day, or null if no entry. */
  average: number | null;
}

/** Average mood per day across the last `days` days, oldest first. */
export function dailyMoodAverages(entries: MoodEntry[], days: number): DailyMood[] {
  const today = startOfDay(new Date());
  const sums = new Map<string, { total: number; count: number }>();
  for (const entry of entries) {
    const key = toISODate(new Date(entry.createdAt));
    const bucket = sums.get(key) ?? { total: 0, count: 0 };
    bucket.total += entry.level;
    bucket.count += 1;
    sums.set(key, bucket);
  }

  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, -(days - 1 - i));
    const bucket = sums.get(toISODate(date));
    return { date, average: bucket ? bucket.total / bucket.count : null };
  });
}

export function entriesForToday(entries: MoodEntry[]): MoodEntry[] {
  const today = new Date();
  return entries.filter((e) => isSameDay(new Date(e.createdAt), today));
}

export function hasCheckedInToday(entries: MoodEntry[]): boolean {
  return entriesForToday(entries).length > 0;
}
