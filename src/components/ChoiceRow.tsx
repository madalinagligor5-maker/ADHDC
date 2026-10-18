import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

interface ChoiceRowProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  /** `radio` for single choice, `checkbox` for multiple. */
  mode?: 'radio' | 'checkbox';
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
}

/** A large, tappable choice row used in onboarding and settings. */
export function ChoiceRow({ title, subtitle, selected, onPress, mode = 'radio', icon, disabled }: ChoiceRowProps) {
  return (
    <Pressable
      accessibilityRole={mode}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed, disabled && styles.disabled]}
    >
      {icon ? <Ionicons name={icon} size={22} color={selected ? colors.action : colors.textMuted} /> : null}
      <View style={styles.text}>
        <AppText variant="label" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.textMuted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={[mode === 'radio' ? styles.radio : styles.checkbox, selected && styles.markOn]}>
        {selected ? <Ionicons name="checkmark" size={16} color={colors.onAction} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 56,
  },
  selected: { borderColor: colors.action, backgroundColor: colors.actionSoft },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 16, lineHeight: 22 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markOn: { backgroundColor: colors.action, borderColor: colors.action },
});
