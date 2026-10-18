import type { AppId, UsageMap } from './apps';
import type { ChallengeId } from './challenges';
import type { DateKey } from './date';

export type Language = 'ro' | 'en';

export type Purpose = 'learning' | 'rest' | 'people' | 'projects' | 'less-scroll';

export const PURPOSES: Purpose[] = ['learning', 'rest', 'people', 'projects', 'less-scroll'];

/** Where a day's numbers came from. A day has exactly one source (no mixing). */
export type UsageSource = 'manual' | 'auto';

export type ScreenTimeMode = 'manual' | 'auto';

export interface DayRecord {
  date: DateKey;
  usage: UsageMap;
  source: UsageSource;
  /** Daily limit that applied to this day, so later goal changes don't rewrite history. */
  limitMin: number;
  challengeId: ChallengeId | null;
  challengeDone: boolean;
  /** True when the app itself confirmed the challenge (e.g. a finished 20-minute pause). */
  challengeVerified: boolean;
}

export interface Settings {
  language: Language;
  dailyLimitMin: number;
  purpose: Purpose | null;
  trackedApps: AppId[];
  notificationsEnabled: boolean;
  screenTimeMode: ScreenTimeMode;
}

export function emptyDay(date: DateKey, limitMin: number): DayRecord {
  return {
    date,
    usage: {},
    source: 'manual',
    limitMin,
    challengeId: null,
    challengeDone: false,
    challengeVerified: false,
  };
}

export function hasUsage(day: DayRecord | undefined): day is DayRecord {
  return day !== undefined && Object.keys(day.usage).length > 0;
}
