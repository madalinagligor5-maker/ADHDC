import { colors, spacing } from '@/theme';
import { AppText } from './AppText';

export function SectionTitle({ children }: { children: string }) {
  return (
    <AppText variant="overline" color={colors.textMuted} accessibilityRole="header" style={{ textTransform: 'uppercase', marginTop: spacing.sm }}>
      {children}
    </AppText>
  );
}
