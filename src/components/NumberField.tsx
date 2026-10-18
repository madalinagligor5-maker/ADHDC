import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import { AppText } from './AppText';

interface NumberFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  invalid?: boolean;
  suffix?: string;
}

/** Digits-only input. Keeps the raw text so the user can clear the field while typing. */
export function NumberField({ label, value, onChangeText, maxLength = 4, invalid, suffix }: NumberFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <AppText variant="caption" color={colors.textMuted}>
        {label}
      </AppText>
      <View style={[styles.box, focused && styles.focused, invalid && styles.invalid]}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={maxLength}
          selectTextOnFocus
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />
        {suffix ? (
          <AppText variant="caption" color={colors.textMuted}>
            {suffix}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: spacing.xs },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: spacing.md,
  },
  focused: { borderColor: colors.action },
  invalid: { borderColor: colors.warning },
  input: { ...typography.number, flex: 1, color: colors.text, paddingVertical: spacing.sm, minWidth: 40, outlineWidth: 0 },
});
