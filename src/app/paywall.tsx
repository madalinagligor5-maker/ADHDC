import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Screen, ScreenHeader } from '@/components';
import { PLANS } from '@/domain/plans';
import { useStrings } from '@/i18n';
import { colors, spacing } from '@/theme';

/** Simple, inactive paywall. No payments in the MVP. */
export default function Paywall() {
  const strings = useStrings();
  const s = strings.paywall;
  const check = (value: boolean) => (value ? '✓' : '—');

  const rows: { label: string; free: string; plus: string }[] = [
    { label: s.features.score, free: '✓', plus: '✓' },
    { label: s.features.challenge, free: String(PLANS.free.dailyChallenges), plus: String(PLANS.plus.dailyChallenges) },
    { label: s.features.history, free: s.historyFree, plus: s.historyPlus },
    { label: s.features.focus, free: check(PLANS.free.advancedFocus), plus: check(PLANS.plus.advancedFocus) },
    { label: s.features.blocks, free: check(PLANS.free.scheduledBlocks), plus: check(PLANS.plus.scheduledBlocks) },
    { label: s.features.stats, free: check(PLANS.free.detailedStats), plus: check(PLANS.plus.detailedStats) },
  ];

  return (
    <Screen footer={<Button label={s.cta} onPress={() => undefined} disabled />}>
      <ScreenHeader title={s.title} modal />
      <AppText variant="body" color={colors.textMuted}>
        {s.subtitle}
      </AppText>

      <Card>
        <View style={styles.row}>
          <View style={styles.label} />
          <AppText variant="label" color={colors.textMuted} style={styles.cell} align="center">
            {s.free}
          </AppText>
          <AppText variant="label" color={colors.accent} style={styles.cell} align="center">
            {s.plus}
          </AppText>
        </View>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <AppText variant="body" style={styles.label}>
              {row.label}
            </AppText>
            <AppText variant="label" color={colors.textMuted} style={styles.cell} align="center">
              {row.free}
            </AppText>
            <AppText variant="label" color={colors.accent} style={styles.cell} align="center">
              {row.plus}
            </AppText>
          </View>
        ))}
      </Card>

      <AppText variant="caption" align="center" color={colors.textMuted}>
        {s.note}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 40 },
  label: { flex: 1 },
  cell: { width: 76 },
});
