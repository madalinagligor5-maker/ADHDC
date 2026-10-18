import type { AppId, UsageMap } from './apps';
import type { DateKey } from './date';

export type Language = 'ro' | 'en';

/** Where a day's usage numbers came from. */
export type UsageSource = 'manual' | 'auto';

/** How the user wants usage to be collected. */
export type ScreenTimeMode = 'auto' | 'manual';

export type FocusDuration = 15 | 30 | 45 | 60;

export interface FocusSession {
  id: string;
  startedAt: number;
  durationMin: FocusDuration;
  completed: boolean;
}

export interface DayRecord {
  date: DateKey;
  usage: UsageMap;
  /** True once the user (or the automatic provider) recorded usage for this day. */
  hasUsage: boolean;
  source: UsageSource;
  challengeId: string | null;
  challengeCompleted: boolean;
  focusSessions: FocusSession[];
}

export interface Settings {
  language: Language;
  dailyLimitMin: number;
  trackedApps: AppId[];
  notificationsEnabled: boolean;
  screenTimeMode: ScreenTimeMode;
}

export interface ActiveFocus {
  startedAt: number;
  durationMin: FocusDuration;
}

export function emptyDay(date: DateKey): DayRecord {
  return {
    date,
    usage: {},
    hasUsage: false,
    source: 'manual',
    challengeId: null,
    challengeCompleted: false,
    focusSessions: [],
  };
}
