import { totalMinutes } from './apps';
import { addDays, type DateKey } from './date';
import { computeScore } from './score';
import { hasUsage, type DayRecord } from './types';

export type DaysById = Record<DateKey, DayRecord | undefined>;

export function dayMinutes(day: DayRecord | undefined): number | null {
  return hasUsage(day) ? totalMinutes(day.usage) : null;
}

export function dayScore(day: DayRecord | undefined): number | null {
  return hasUsage(day) ? computeScore(totalMinutes(day.usage), day.limitMin) : null;
}

/** A day counts as "goal met" only with recorded data within that day's limit. */
export function dayMetGoal(day: DayRecord | undefined): boolean {
  const minutes = dayMinutes(day);
  return day !== undefined && minutes !== null && minutes <= day.limitMin;
}

/**
 * Consecutive finished days with data and the goal met, ending yesterday.
 * Today is never counted because it is not over yet; days without data break the streak.
 */
export function currentStreak(days: DaysById, today: DateKey): number {
  let cursor = addDays(today, -1);
  let streak = 0;
  while (dayMetGoal(days[cursor])) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export interface SeriesPoint {
  date: DateKey;
  /** `null` = no data for that day (not the same as 0 minutes). */
  minutes: number | null;
  score: number | null;
  limitMin: number | null;
  metGoal: boolean;
}

export function buildSeries(days: DaysById, keys: DateKey[]): SeriesPoint[] {
  return keys.map((date) => {
    const day = days[date];
    return {
      date,
      minutes: dayMinutes(day),
      score: dayScore(day),
      limitMin: hasUsage(day) ? day.limitMin : null,
      metGoal: dayMetGoal(day),
    };
  });
}

export interface PeriodSummary {
  daysWithData: number;
  daysMetGoal: number;
  /** Average minutes per day with data; `null` when there is no data. */
  averageMinutes: number | null;
}

export function summarize(series: SeriesPoint[]): PeriodSummary {
  const withData = series.filter((point) => point.minutes !== null);
  const total = withData.reduce((sum, point) => sum + (point.minutes ?? 0), 0);
  return {
    daysWithData: withData.length,
    daysMetGoal: series.filter((point) => point.metGoal).length,
    averageMinutes: withData.length === 0 ? null : total / withData.length,
  };
}

/** Minimum days with data in *each* period before two periods are compared. */
export const MIN_DAYS_FOR_COMPARISON = 4;

/**
 * Difference in average daily minutes (previous − current). Positive means usage
 * went down. Returns `null` when either period has too little data.
 */
export function compareAverages(current: PeriodSummary, previous: PeriodSummary): number | null {
  if (current.daysWithData < MIN_DAYS_FOR_COMPARISON || previous.daysWithData < MIN_DAYS_FOR_COMPARISON) return null;
  if (current.averageMinutes === null || previous.averageMinutes === null) return null;
  return Math.round(previous.averageMinutes - current.averageMinutes);
}
