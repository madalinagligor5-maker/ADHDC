import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import i18n, { resolveDeviceLanguage, type SupportedLanguage } from '@/i18n';

export type ThemeMode = 'system' | 'light' | 'dark';

export type OnboardingGoal = 'organize' | 'focus' | 'routines' | 'mood' | 'remember' | 'calm';
export type FocusBlock = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ReminderPrefs {
  /** Master switch — also implies notification permission was requested. */
  enabled: boolean;
  morningSummary: boolean;
  eveningSummary: boolean;
  gentleNudges: boolean;
  /** `HH:mm` times for the daily summaries. */
  morningTime: string;
  eveningTime: string;
}

interface SettingsState {
  /** User's display name (used in greetings). */
  name: string;
  /** Explicit language choice, or null to follow the device locale. */
  language: SupportedLanguage | null;
  themeMode: ThemeMode;
  reduceMotion: boolean;
  /** First-run onboarding finished. */
  onboardingComplete: boolean;
  goals: OnboardingGoal[];
  focusBlocks: FocusBlock[];
  reminders: ReminderPrefs;
  /** Badge ids already celebrated, so confetti fires only once per milestone. */
  celebratedBadges: string[];
  /** Highest level already celebrated. */
  celebratedLevel: number;
  /** Becomes true once persisted state has loaded from disk. */
  hasHydrated: boolean;

  setName: (name: string) => void;
  setLanguage: (language: SupportedLanguage | null) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setReduceMotion: (value: boolean) => void;
  setGoals: (goals: OnboardingGoal[]) => void;
  setFocusBlocks: (blocks: FocusBlock[]) => void;
  setReminders: (reminders: ReminderPrefs) => void;
  setOnboardingComplete: (value: boolean) => void;
  setCelebratedBadges: (ids: string[]) => void;
  setCelebratedLevel: (level: number) => void;
}

/** The language i18next should actually use given the current settings. */
export function effectiveLanguage(language: SupportedLanguage | null): SupportedLanguage {
  return language ?? resolveDeviceLanguage();
}

function applyLanguage(language: SupportedLanguage | null) {
  const next = effectiveLanguage(language);
  if (i18n.language !== next) {
    void i18n.changeLanguage(next);
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      name: '',
      language: null,
      themeMode: 'system',
      reduceMotion: false,
      onboardingComplete: false,
      goals: [],
      focusBlocks: [],
      reminders: {
        enabled: false,
        morningSummary: true,
        eveningSummary: true,
        gentleNudges: true,
        morningTime: '08:00',
        eveningTime: '20:00',
      },
      celebratedBadges: [],
      celebratedLevel: 1,
      hasHydrated: false,

      setName: (name) => set({ name }),
      setLanguage: (language) => {
        set({ language });
        applyLanguage(language);
      },
      setThemeMode: (themeMode) => set({ themeMode }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setGoals: (goals) => set({ goals }),
      setFocusBlocks: (focusBlocks) => set({ focusBlocks }),
      setReminders: (reminders) => set({ reminders }),
      setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
      setCelebratedBadges: (celebratedBadges) => set({ celebratedBadges }),
      setCelebratedLevel: (celebratedLevel) => set({ celebratedLevel }),
    }),
    {
      name: 'adhdcal-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        name: state.name,
        language: state.language,
        themeMode: state.themeMode,
        reduceMotion: state.reduceMotion,
        onboardingComplete: state.onboardingComplete,
        goals: state.goals,
        focusBlocks: state.focusBlocks,
        reminders: state.reminders,
        celebratedBadges: state.celebratedBadges,
        celebratedLevel: state.celebratedLevel,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply the persisted (or device-detected) language once we know it.
        applyLanguage(state?.language ?? null);
        useSettingsStore.setState({ hasHydrated: true });
      },
    },
  ),
);
