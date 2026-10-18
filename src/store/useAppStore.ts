import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { APP_IDS, ONBOARDING_APPS, sanitizeMinutes, type AppId, type UsageMap } from '@/domain/apps';
import { toDateKey, type DateKey } from '@/domain/date';
import {
  emptyDay,
  type ActiveFocus,
  type DayRecord,
  type FocusDuration,
  type ScreenTimeMode,
  type Settings,
  type UsageSource,
} from '@/domain/types';

export const DEFAULT_SETTINGS: Settings = {
  language: 'ro',
  dailyLimitMin: 60,
  trackedApps: ONBOARDING_APPS,
  notificationsEnabled: false,
  screenTimeMode: 'manual',
};

interface PersistedState {
  onboarded: boolean;
  settings: Settings;
  days: Record<DateKey, DayRecord>;
  activeFocus: ActiveFocus | null;
}

interface Actions {
  completeOnboarding: (mode: ScreenTimeMode) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setUsage: (date: DateKey, usage: UsageMap, source: UsageSource) => void;
  setChallengeCompleted: (date: DateKey, challengeId: string, completed: boolean) => void;
  startFocus: (durationMin: FocusDuration, now?: number) => void;
  finishFocus: (completed: boolean) => void;
  resetAll: () => void;
}

export type AppState = PersistedState & Actions;

const initialState: PersistedState = {
  onboarded: false,
  settings: DEFAULT_SETTINGS,
  days: {},
  activeFocus: null,
};

function cleanUsage(usage: UsageMap): UsageMap {
  const result: UsageMap = {};
  for (const id of APP_IDS) {
    const value = usage[id];
    if (value !== undefined) result[id] = sanitizeMinutes(value);
  }
  return result;
}

function cleanApps(apps: AppId[]): AppId[] {
  const unique = APP_IDS.filter((id) => apps.includes(id));
  return unique.length > 0 ? unique : DEFAULT_SETTINGS.trackedApps;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      completeOnboarding: (mode) =>
        set((state) => ({
          onboarded: true,
          settings: { ...state.settings, screenTimeMode: mode },
        })),

      updateSettings: (patch) =>
        set((state) => {
          const next = { ...state.settings, ...patch };
          next.trackedApps = cleanApps(next.trackedApps);
          next.dailyLimitMin = Math.max(5, sanitizeMinutes(next.dailyLimitMin));
          return { settings: next };
        }),

      setUsage: (date, usage, source) =>
        set((state) => {
          const day = state.days[date] ?? emptyDay(date);
          return {
            days: {
              ...state.days,
              [date]: { ...day, usage: cleanUsage(usage), hasUsage: true, source },
            },
          };
        }),

      setChallengeCompleted: (date, challengeId, completed) =>
        set((state) => {
          const day = state.days[date] ?? emptyDay(date);
          return {
            days: {
              ...state.days,
              [date]: { ...day, challengeId, challengeCompleted: completed },
            },
          };
        }),

      startFocus: (durationMin, now = Date.now()) =>
        set({ activeFocus: { startedAt: now, durationMin } }),

      finishFocus: (completed) =>
        set((state) => {
          const active = state.activeFocus;
          if (!active) return {};
          const date = toDateKey(new Date(active.startedAt));
          const day = state.days[date] ?? emptyDay(date);
          const session = {
            id: `${active.startedAt}`,
            startedAt: active.startedAt,
            durationMin: active.durationMin,
            completed,
          };
          return {
            activeFocus: null,
            days: {
              ...state.days,
              [date]: { ...day, focusSessions: [...day.focusSessions, session] },
            },
          };
        }),

      resetAll: () => set(initialState),
    }),
    {
      name: 'scrollfade-state',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ onboarded, settings, days, activeFocus }): PersistedState => ({
        onboarded,
        settings,
        days,
        activeFocus,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PersistedState>;
        return {
          ...current,
          ...saved,
          settings: { ...DEFAULT_SETTINGS, ...saved.settings },
        };
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
