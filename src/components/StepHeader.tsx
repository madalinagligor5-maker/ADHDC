import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { format, useStrings } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

/** Back button + "Step x of y" + a thin progress bar for onboarding. */
export function StepHeader({ current, total }: { current: number; total: number }) {
  const strings = useStrings();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.common.back}
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <AppText variant="caption" color={colors.textMuted}>
          {format(strings.onboarding.step, { current, total })}
        </AppText>
      </View>
      <View style={styles.track} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.fill, { width: `${(current / total) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.progress, borderRadius: 2 },
});
