import { colors } from '@/theme';
import { AppText } from './AppText';

export function SectionTitle({ children }: { children: string }) {
  return (
    <AppText variant="caption" color={colors.textMuted} style={{ textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 }}>
      {children}
    </AppText>
  );
}
