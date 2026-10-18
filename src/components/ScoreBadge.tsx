import { StyleSheet, View } from 'react-native';

import type { ScoreTier } from '@/domain/score';
import { useStrings } from '@/i18n';
import { radius, spacing, tierColor } from '@/theme';
import { AppText } from './AppText';

export function ScoreBadge({ tier }: { tier: ScoreTier }) {
  const strings = useStrings();
  const color = tierColor(tier);
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="label" color={color}>
        {strings.tiers[tier]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
