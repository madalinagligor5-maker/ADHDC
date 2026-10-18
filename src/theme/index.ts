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

/**
 * Semantic colors. Rules: black dominates; cyan = primary actions; mint =
 * progress; pink = identity only (logo); coral = discreet warnings.
 */
export const colors = {
  background: palette.black,
  surface: palette.charcoal,
  surfaceRaised: palette.surface,
  border: '#20202A',
  borderStrong: '#2E2E3A',
  text: palette.offWhite,
  textMuted: palette.mutedGray,
  textFaint: '#64748B',
  action: palette.cyan,
  actionSoft: 'rgba(34, 211, 238, 0.10)',
  onAction: palette.black,
  progress: palette.mint,
  progressSoft: 'rgba(52, 211, 153, 0.10)',
  warning: palette.coral,
  warningSoft: 'rgba(251, 113, 133, 0.10)',
  brand: palette.pink,
} as const;

/** Cyan → mint, used by the logo and the score ring only. */
export const brandGradient = [palette.cyan, palette.mint] as const;

export const fonts = {
  heading: 'Outfit-Bold',
  body: 'Inter-Regular',
  bodySemiBold: 'Inter-SemiBold',
} as const;

/** 8-point grid. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/** Minimum touch target (iOS HIG 44pt, Material 48dp). */
export const TOUCH_TARGET = 48;

// Custom fonts carry their own weight, so no fontWeight here (Android would ignore the family otherwise).
export const typography = {
  hero: { fontFamily: fonts.heading, fontSize: 36, lineHeight: 42, letterSpacing: -0.5 },
  title: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 26 },
  number: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: fonts.bodySemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 1 },
} as const;

export type TypographyVariant = keyof typeof typography;
