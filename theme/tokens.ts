/**
 * Design tokens — the single source of truth for ADHDCal's visual language.
 *
 * Two complete palettes (light + dark) share one `ThemeColors` shape so every
 * component can read `theme.colors.x` without caring which mode is active.
 * ADHD-first intent: warm, calm, low-contrast-but-AA-compliant, never harsh.
 */

export type ThemeName = 'light' | 'dark';

export interface ThemeColors {
  // Brand
  primary: string;
  primarySoft: string;
  primaryTint: string;
  onPrimary: string;
  // Focus / success (green)
  success: string;
  successSoft: string;
  onSuccess: string;
  // Surfaces
  bg: string;
  surface: string;
  surfaceAlt: string;
  // Accents
  coral: string;
  mustard: string;
  teal: string;
  // Text
  text: string;
  textMuted: string;
  textInverse: string;
  // Lines & states
  border: string;
  borderStrong: string;
  overlay: string;
  // Semantic
  danger: string;
  warning: string;
}

const lightColors: ThemeColors = {
  primary: '#6C5CE7',
  primarySoft: '#E8E3FF',
  primaryTint: '#F3F0FF',
  onPrimary: '#FFFFFF',

  success: '#1E8A5F',
  successSoft: '#D8EFE0',
  onSuccess: '#FFFFFF',

  bg: '#FBF8F0',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F1E8',

  coral: '#FF8A80',
  mustard: '#F4C95D',
  teal: '#3FB6A8',

  text: '#2D2B3A',
  textMuted: '#6E6B7B',
  textInverse: '#FFFFFF',

  border: '#ECE8DD',
  borderStrong: '#DAD4C8',
  overlay: 'rgba(45, 43, 58, 0.45)',

  danger: '#D9534F',
  warning: '#E0A100',
};

const darkColors: ThemeColors = {
  primary: '#9A8BFF',
  primarySoft: '#322C4D',
  primaryTint: '#272340',
  onPrimary: '#15121F',

  success: '#4FB888',
  successSoft: '#1E3A2D',
  onSuccess: '#0F1A14',

  bg: '#161420',
  surface: '#211E2E',
  surfaceAlt: '#2A2638',

  coral: '#FF9E94',
  mustard: '#F4CE6E',
  teal: '#54C7B8',

  text: '#F2F0F7',
  textMuted: '#A8A4B8',
  textInverse: '#15121F',

  border: '#332F42',
  borderStrong: '#433E55',
  overlay: 'rgba(0, 0, 0, 0.55)',

  danger: '#FF8A82',
  warning: '#F4CE6E',
};

/** Spacing scale (4px base) — generous whitespace reduces cognitive load. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Corner radii — soft, rounded, friendly. Cards 20–24, buttons 16. */
export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

/**
 * Font family keys map to the weights we load via expo-font (Nunito).
 * Until fonts load these fall back to the system rounded sans-serif.
 */
export const fontFamily = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
} as const;

/** Type scale from the design system. */
export const typography = {
  h1: { fontSize: 28, lineHeight: 36, fontFamily: fontFamily.bold },
  h2: { fontSize: 22, lineHeight: 30, fontFamily: fontFamily.bold },
  title: { fontSize: 18, lineHeight: 26, fontFamily: fontFamily.semibold },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.regular },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.semibold },
  caption: { fontSize: 13, lineHeight: 18, fontFamily: fontFamily.medium },
} as const;

export type ShadowToken = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

/** Very soft shadows: low opacity, large blur. */
export const shadows: Record<'sm' | 'md' | 'lg', ShadowToken> = {
  sm: {
    shadowColor: '#2D2B3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D2B3A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2D2B3A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
};

export interface Theme {
  name: ThemeName;
  dark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  fontFamily: typeof fontFamily;
  shadows: typeof shadows;
}

export const lightTheme: Theme = {
  name: 'light',
  dark: false,
  colors: lightColors,
  spacing,
  radii,
  typography,
  fontFamily,
  shadows,
};

export const darkTheme: Theme = {
  name: 'dark',
  dark: true,
  colors: darkColors,
  spacing,
  radii,
  typography,
  fontFamily,
  shadows,
};
