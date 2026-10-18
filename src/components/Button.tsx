import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, Pressable, StyleSheet } from 'react-native';

import { colors, fonts, radius, spacing, TOUCH_TARGET } from '@/theme';
import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
}

const TEXT_COLOR: Record<ButtonVariant, string> = {
  primary: colors.onAction,
  secondary: colors.text,
  ghost: colors.action,
  danger: colors.warning,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityHint,
}: ButtonProps) {
  const inactive = disabled || loading;
  const handlePress = () => {
    if (variant === 'primary' && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityHint={accessibilityHint}
      disabled={inactive}
      onPress={handlePress}
      style={({ pressed }) => [styles.base, styles[variant], inactive && styles.disabled, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={TEXT_COLOR[variant]} />
      ) : (
        <AppText align="center" color={TEXT_COLOR[variant]} style={variant === 'primary' ? styles.primaryLabel : styles.label}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  primary: { backgroundColor: colors.action },
  secondary: { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent', minHeight: TOUCH_TARGET },
  danger: { backgroundColor: colors.warningSoft, borderWidth: 1, borderColor: colors.warning },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  primaryLabel: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 24 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 22 },
});
