import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

type Tone = 'info' | 'success' | 'warning';

const TONES: Record<Tone, { color: string; background: string; icon: 'information-circle-outline' | 'checkmark-circle-outline' | 'alert-circle-outline' }> = {
  info: { color: colors.textMuted, background: colors.surface, icon: 'information-circle-outline' },
  success: { color: colors.progress, background: colors.progressSoft, icon: 'checkmark-circle-outline' },
  warning: { color: colors.warning, background: colors.warningSoft, icon: 'alert-circle-outline' },
};

interface NoticeProps {
  tone?: Tone;
  children: string;
  action?: ReactNode;
}

/** Inline message. Success notices only appear after an action really succeeded. */
export function Notice({ tone = 'info', children, action }: NoticeProps) {
  const style = TONES[tone];
  return (
    <View
      style={[styles.box, { backgroundColor: style.background, borderColor: tone === 'info' ? colors.border : style.color }]}
      accessibilityRole={tone === 'warning' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.row}>
        <Ionicons name={style.icon} size={20} color={style.color} />
        <AppText variant="caption" color={tone === 'info' ? colors.textMuted : colors.text} style={styles.text}>
          {children}
        </AppText>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  text: { flex: 1 },
});
