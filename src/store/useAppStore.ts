import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { APP_IDS, type AppId, type UsageMap } from '@/domain/apps';
import { getChallenge, type ChallengeId } from '@/domain/challenges';
import { todayKey, type DateKey } from '@/domain/date';
import {
  endPause,
  holdPause,
  resumePause,
  startPause,
  type ActivePause,
  type PauseDuration,
  type PauseSession,
} from '@/domain/pause';
import { isValidLimit, MAX_LIMIT, MIN_LIMIT } from '@/domain/score';
import { normalizeAutoUsage, validateEntry, type EntryError } from '@/domain/usage';
import { emptyDay, type DayRecord, type Purpose, type ScreenTimeMode, type Settings } from '@/domain/types';

export const DEFAULT_SETTINGS: Settings = {
  language: 'ro',
  dailyLimitMin: 60,
  purpose: null,
  trackedApps: ['tiktok', 'instagram', 'youtube'],
  notificationsEnabled: false,
  screenTimeMode: 'manual',
};

interface PersistedState {
  onboarded: boolean;
  settings: Settings;
  days: Record<DateKey, DayRecord>;
  pauses: PauseSession[];
  activePause: ActivePause | null;
  /** First-use explanation of the score ("100 = within your limit"). */
  scoreTipSeen: boolean;
  /** Development-only Plus override. Ignored in production builds (see useEntitlement). */
  devPlus: boolean;
}

interface SessionState {
  /** Demo mode is never persisted and never touches real data. */
  demo: boolean;
}

export interface OnboardingResult {
  purpose: Purpose | null;
  trackedApps: AppId[];
  dailyLimitMin: number;
  screenTimeMode: ScreenTimeMode;
}

interface Actions {
  completeOnboarding: (result: OnboardingResult) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  /** Manual entry. Re-entering an app for the same day replaces the value. */
  setAppMinutes: (date: DateKey, app: AppId, minutes: number) => EntryError | null;
  deleteAppMinutes: (date: DateKey, app: AppId) => void;
  /** Automatic sync. Never overwrites a day that has manual entries. Returns whether it was applied. */
  applyAutoUsage: (date: DateKey, usage: UsageMap) => boolean;
  setChallenge: (date: DateKey, id: ChallengeId) => void;
  setChallengeDone: (date: DateKey, id: ChallengeId, done: boolean) => void;
  startPause: (minutes: PauseDuration, now?: number) => void;
  holdPause: (now?: number) => void;
  resumePause: (now?: number) => void;
  /** Ends the active pause and records it. Returns the stored session. */
  endPause: (now?: number) => PauseSession | null;
  dismissScoreTip: () => void;
  enterDemo: () => void;
  exitDemo: () => void;
  setDevPlus: (value: boolean) => void;
  resetAll: () => void;
}

export type AppState = PersistedState & SessionState & Actions;

const initialState: PersistedState & SessionState = {
  onboarded: false,
  settings: DEFAULT_SETTINGS,
  days: {},
  pauses: [],
  activePause: null,
  scoreTipSeen: false,
  devPlus: false,
  demo: false,
};

function clampLimit(value: number): number {
  if (!isValidLimit(value)) return DEFAULT_SETTINGS.dailyLimitMin;
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.round(value)));
}

function cleanApps(apps: AppId[]): AppId[] {
  const valid = APP_IDS.filter((id) => apps.includes(id));
  return valid.length > 0 ? valid : DEFAULT_SETTINGS.trackedApps;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      /** Existing record for a day, or a new one using the limit in force now. */
      const dayFor = (date: DateKey): DayRecord => get().days[date] ?? emptyDay(date, get().settings.dailyLimitMin);
      const saveDay = (day: DayRecord) => set((state) => ({ days: { ...state.days, [day.date]: day } }));

      return {
        ...initialState,

        completeOnboarding: (result) =>
          set((state) => ({
            onboarded: true,
            demo: false,
            settings: {
              ...state.settings,
              purpose: result.purpose,
              trackedApps: cleanApps(result.trackedApps),
              dailyLimitMin: clampLimit(result.dailyLimitMin),
              screenTimeMode: result.screenTimeMode,
            },
          })),

        updateSettings: (patch) =>
          set((state) => {
            const settings = { ...state.settings, ...patch };
            settings.trackedApps = cleanApps(settings.trackedApps);
            settings.dailyLimitMin = clampLimit(settings.dailyLimitMin);
            // A new goal applies to today; past days keep the limit they had.
            const today = todayKey();
            const todayRecord = state.days[today];
            const days =
              todayRecord && todayRecord.limitMin !== settings.dailyLimitMin
                ? { ...state.days, [today]: { ...todayRecord, limitMin: settings.dailyLimitMin } }
                : state.days;
            return { settings, days };
          }),

        setAppMinutes: (date, app, minutes) => {
          const day = dayFor(date);
          // Rule: one source per day. Editing an automatic day turns it into a manual day.
          // The automatic values stay as the starting point; the user sees this rule in the form.
          const error = validateEntry(day.usage, app, minutes);
          if (error) return error;
          saveDay({ ...day, source: 'manual', usage: { ...day.usage, [app]: minutes } });
          return null;
        },

        deleteAppMinutes: (date, app) => {
          const day = get().days[date];
          if (!day || day.usage[app] === undefined) return;
          const usage = { ...day.usage };
          delete usage[app];
          saveDay({ ...day, usage });
        },

        applyAutoUsage: (date, usage) => {
          const day = dayFor(date);
          if (day.source === 'manual' && Object.keys(day.usage).length > 0) return false;
          saveDay({ ...day, source: 'auto', usage: normalizeAutoUsage(usage) });
          return true;
        },

        setChallenge: (date, id) => {
          const day = dayFor(date);
          if (day.challengeId === id) return;
          saveDay({ ...day, challengeId: id, challengeDone: false, challengeVerified: false });
        },

        setChallengeDone: (date, id, done) => {
          const day = dayFor(date);
          saveDay({ ...day, challengeId: id, challengeDone: done, challengeVerified: false });
        },

        startPause: (minutes, now = Date.now()) => set({ activePause: startPause(minutes, now) }),

        holdPause: (now = Date.now()) =>
          set((state) => (state.activePause ? { activePause: holdPause(state.activePause, now) } : {})),

        resumePause: (now = Date.now()) =>
          set((state) => (state.activePause ? { activePause: resumePause(state.activePause, now) } : {})),

        endPause: (now = Date.now()) => {
          const state = get();
          if (!state.activePause) return null;
          const session = endPause(state.activePause, now);
          if (state.demo) {
            set({ activePause: null });
            return session;
          }
          // A finished pause confirms a matching "pause" challenge for that day.
          const date = todayKey(new Date(session.startedAt));
          const day = state.days[date] ?? emptyDay(date, state.settings.dailyLimitMin);
          const challenge = getChallenge(day.challengeId);
          const confirms =
            session.completed &&
            challenge?.verification.kind === 'pause' &&
            session.plannedMin >= challenge.verification.minMinutes;
          set({
            activePause: null,
            pauses: [...state.pauses, session],
            days: confirms
              ? { ...state.days, [date]: { ...day, challengeDone: true, challengeVerified: true } }
              : state.days,
          });
          return session;
        },

        dismissScoreTip: () => set({ scoreTipSeen: true }),
        enterDemo: () => set({ demo: true }),
        // A pause started while exploring the demo is discarded with it.
        exitDemo: () => set((state) => ({ demo: false, activePause: state.demo ? null : state.activePause })),
        setDevPlus: (value) => set({ devPlus: value }),
        resetAll: () => set({ ...initialState, settings: { ...DEFAULT_SETTINGS, language: get().settings.language } }),
      };
    },
    {
      name: 'scrollfade-state',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ onboarded, settings, days, pauses, activePause, scoreTipSeen, devPlus }): PersistedState => ({
        onboarded,
        settings,
        days,
        pauses,
        activePause,
        scoreTipSeen,
        devPlus,
      }),
      // v1 used a different data model (bonus-based score); start fresh but keep the language.
      migrate: (persisted, version) => {
        const saved = (persisted ?? {}) as Partial<PersistedState>;
        if (version < 2) {
          return { settings: { ...DEFAULT_SETTINGS, language: saved.settings?.language ?? 'ro' } };
        }
        return saved;
      },
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PersistedState>;
        return { ...current, ...saved, settings: { ...DEFAULT_SETTINGS, ...saved.settings } };
      },
    },
  ),
);

/** True once persisted data has been loaded from AsyncStorage. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAppStore.persist.onFinishHydration(onChange),
    () => useAppStore.persist.hasHydrated(),
  );
}
