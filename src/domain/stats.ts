import { totalMinutes, type AppId, type UsageMap } from './apps';
import { addDays, type DateKey } from './date';
import { computeScore, type ScoreBreakdown } from './score';
import type { DayRecord, FocusDuration, Settings } from './types';

export type DaysById = Record<DateKey, DayRecord | undefined>;

export function completedFocusDurations(day: DayRecord | undefined): FocusDuration[] {
  return (day?.focusSessions ?? [])
    .filter((session) => session.completed)
    .map((session) => session.durationMin);
}

export function dayMinutes(day: DayRecord | undefined, trackedApps: readonly AppId[]): number {
  return day ? totalMinutes(day.usage, trackedApps) : 0;
}

/** Score for a day, or null when there is no usage data to score yet. */
export function dayScore(
  day: DayRecord | undefined,
  settings: Pick<Settings, 'dailyLimitMin' | 'trackedApps'>,
): ScoreBreakdown | null {
  if (!day || !day.hasUsage) return null;
  return computeScore({
    minutes: dayMinutes(day, settings.trackedApps),
    dailyLimitMin: settings.dailyLimitMin,
    challengeCompleted: day.challengeCompleted,
    completedFocus: completedFocusDurations(day),
  });
}

/** A day keeps the streak alive if the limit was respected or the challenge was completed. */
export function dayKeepsStreak(
  day: DayRecord | undefined,
  settings: Pick<Settings, 'dailyLimitMin' | 'trackedApps'>,
): boolean {
  if (!day) return false;
  if (day.challengeCompleted) return true;
  return day.hasUsage && dayMinutes(day, settings.trackedApps) <= settings.dailyLimitMin;
}

/**
 * Consecutive qualifying days ending today. Today is still in progress, so if
 * it does not qualify yet the streak is counted up to yesterday.
 */
export function currentStreak(
  days: DaysById,
  today: DateKey,
  settings: Pick<Settings, 'dailyLimitMin' | 'trackedApps'>,
): number {
  let cursor = dayKeepsStreak(days[today], settings) ? today : addDays(today, -1);
  let streak = 0;
  while (dayKeepsStreak(days[cursor], settings)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function sumUsage(records: (DayRecord | undefined)[], apps: readonly AppId[]): UsageMap {
  const totals: UsageMap = {};
  for (const record of records) {
    if (!record) continue;
    for (const id of apps) {
      totals[id] = (totals[id] ?? 0) + (record.usage[id] ?? 0);
    }
  }
  return totals;
}

export interface ScoredDay {
  date: DateKey;
  score: number;
  minutes: number;
}

export function bestAndWorst(scored: ScoredDay[]): { best?: ScoredDay; worst?: ScoredDay } {
  if (scored.length === 0) return {};
  const sorted = [...scored].sort((a, b) => b.score - a.score || a.minutes - b.minutes);
  return { best: sorted[0], worst: sorted.length > 1 ? sorted[sorted.length - 1] : undefined };
}
