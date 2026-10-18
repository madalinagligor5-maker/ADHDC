import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { AppText } from './AppText';

interface StatRowProps {
  label: string;
  value: string;
  valueColor?: string;
  dotColor?: string;
}

export function StatRow({ label, value, valueColor = colors.text, dotColor }: StatRowProps) {
  return (
    <View style={styles.row}>
      {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      <AppText variant="body" color={colors.textMuted} style={styles.label}>
        {label}
      </AppText>
      <AppText variant="label" color={valueColor}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 32 },
  label: { flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
