import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion, useTheme } from '@/theme';
import { Text } from './Text';

interface StreakBadgeProps {
  count: number;
  /** Already-localized label, e.g. "12 days". */
  label: string;
  /** Optional encouraging line under the count. */
  caption?: string;
}

export function StreakBadge({ count, label, caption }: StreakBadgeProps) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 750 }), withTiming(1, { duration: 750 })),
      -1,
      false,
    );
  }, [reduceMotion, scale, count]);

  const pulse = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.primaryTint, borderRadius: theme.radii.lg },
      ]}
    >
      <Animated.View style={[styles.flame, pulse]}>
        <Text variant="h2">🔥</Text>
        <Text variant="h2" color="primary">
          {count}
        </Text>
      </Animated.View>
      <View style={styles.text}>
        <Text variant="bodyStrong">{label}</Text>
        {caption ? (
          <Text variant="caption" color="textMuted">
            {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  flame: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { flex: 1, gap: 2 },
});
