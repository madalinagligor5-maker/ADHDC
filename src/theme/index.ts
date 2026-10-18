import type { ScoreTier } from '@/domain/score';

export const colors = {
  background: '#070B14',
  surface: '#0F1626',
  surfaceAlt: '#16203A',
  border: '#1F2B47',
  text: '#F5F7FA',
  textMuted: '#8B95A7',
  textFaint: '#5A6478',
  accent: '#2EF2C2',
  accentSoft: 'rgba(46, 242, 194, 0.14)',
  onAccent: '#04110D',
  good: '#7CF29C',
  moderate: '#F2D04B',
  coral: '#FF6B5E',
  coralSoft: 'rgba(255, 107, 94, 0.14)',
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
  lg: 24,
  pill: 999,
} as const;

export const typography = {
  hero: { fontSize: 36, lineHeight: 42, fontWeight: '800' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Coral is reserved for high-brainrot (low) scores. */
export function tierColor(tier: ScoreTier): string {
  switch (tier) {
    case 'clean':
      return colors.accent;
    case 'good':
      return colors.good;
    case 'moderate':
      return colors.moderate;
    default:
      return colors.coral;
  }
}
