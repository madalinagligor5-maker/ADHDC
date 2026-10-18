import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing, TOUCH_TARGET } from '@/theme';
import { AppText } from './AppText';

interface SegmentedProps<T extends string | number> {
  options: { value: T; label: string; disabled?: boolean }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

export function Segmented<T extends string | number>({ options, value, onChange, accessibilityLabel }: SegmentedProps<T>) {
  return (
    <View style={styles.container} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active, disabled: option.disabled }}
            disabled={option.disabled}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && styles.active, option.disabled && styles.disabled]}
          >
            <AppText variant="label" align="center" color={active ? colors.onAction : colors.text}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 56,
    minHeight: TOUCH_TARGET - 4,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  active: { backgroundColor: colors.action },
  disabled: { opacity: 0.4 },
});
