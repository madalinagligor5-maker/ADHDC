import type { ScoreTier } from '@/domain/score';

/** ScrollFade brand palette. */
export const palette = {
  black: '#000000',
  charcoal: '#0B0B0F',
  surface: '#14141B',
  cyan: '#22D3EE',
  mint: '#34D399',
  pink: '#F472B6',
  coral: '#FB7185',
  offWhite: '#F8FAFC',
  mutedGray: '#94A3B8',
} as const;

export const colors = {
  background: palette.black,
  surface: palette.charcoal,
  surfaceAlt: palette.surface,
  border: '#1E1E28',
  text: palette.offWhite,
  textMuted: palette.mutedGray,
  textFaint: '#5B6475',
  accent: palette.mint,
  accentAlt: palette.cyan,
  accentSoft: 'rgba(52, 211, 153, 0.12)',
  onAccent: palette.black,
  pink: palette.pink,
  coral: palette.coral,
  coralSoft: 'rgba(251, 113, 133, 0.12)',
} as const;

/** Cyan → mint, used by the logo, score ring and progress. */
export const brandGradient = [palette.cyan, palette.mint] as const;

export const fonts = {
  heading: 'Outfit-Bold',
  body: 'Inter-Regular',
  bodySemiBold: 'Inter-SemiBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

// Custom fonts carry their own weight, so no fontWeight here (Android would ignore the family otherwise).
export const typography = {
  hero: { fontFamily: fonts.heading, fontSize: 38, lineHeight: 44, letterSpacing: -0.5 },
  title: { fontFamily: fonts.heading, fontSize: 30, lineHeight: 36, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Coral is reserved for high-brainrot (low) scores. */
export function tierColor(tier: ScoreTier): string {
  switch (tier) {
    case 'clean':
      return palette.mint;
    case 'good':
      return palette.cyan;
    case 'moderate':
      return palette.pink;
    default:
      return palette.coral;
  }
}
