import { Check } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion, useTheme } from '@/theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  size?: number;
  accessibilityLabel?: string;
  color?: string;
}

export function Checkbox({
  checked,
  onChange,
  size = 26,
  accessibilityLabel,
  color,
}: CheckboxProps) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const tint = color ?? theme.colors.success;
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    const to = checked ? 1 : 0;
    progress.value = reduceMotion
      ? withTiming(to, { duration: 0 })
      : withSpring(to, { damping: 14, stiffness: 220 });
  }, [checked, reduceMotion, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
    opacity: progress.value,
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      onPress={() => onChange(!checked)}
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
          borderColor: checked ? tint : theme.colors.borderStrong,
        },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.fill,
          { backgroundColor: tint, borderRadius: size * 0.32 },
          fillStyle,
        ]}
      >
        <Check size={size * 0.62} color={theme.colors.onSuccess} strokeWidth={3.5} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: { alignItems: 'center', justifyContent: 'center' },
});
