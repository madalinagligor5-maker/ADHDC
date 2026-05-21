import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import { darkTheme, lightTheme, type Theme } from './tokens';

interface ThemeContextValue {
  theme: Theme;
  /** When true, components must skip non-essential animations. */
  reduceMotion: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const reduceMotionSetting = useSettingsStore((s) => s.reduceMotion);

  const value = useMemo<ThemeContextValue>(() => {
    const resolved = themeMode === 'system' ? (systemScheme ?? 'light') : themeMode;
    return {
      theme: resolved === 'dark' ? darkTheme : lightTheme,
      reduceMotion: reduceMotionSetting,
    };
  }, [themeMode, systemScheme, reduceMotionSetting]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx.theme;
}

export function useReduceMotion(): boolean {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useReduceMotion must be used within a ThemeProvider');
  }
  return ctx.reduceMotion;
}
