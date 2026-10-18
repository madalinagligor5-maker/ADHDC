import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { sanitizeMinutes } from '@/domain/apps';
import { colors, radius, spacing, typography } from '@/theme';
import { AppText } from './AppText';

interface MinutesStepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  unit: string;
  accessibilityLabel: string;
}

export function MinutesStepper({ value, onChange, step = 5, min = 0, unit, accessibilityLabel }: MinutesStepperProps) {
  const update = (next: number) => onChange(Math.max(min, sanitizeMinutes(next)));

  return (
    <View style={styles.row}>
      <StepButton label="−" onPress={() => update(value - step)} accessibilityLabel={`${accessibilityLabel} −${step}`} />
      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel={accessibilityLabel}
          value={String(value)}
          onChangeText={(text) => update(Number(text.replace(/[^0-9]/g, '')) || 0)}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={4}
          selectTextOnFocus
          style={styles.input}
        />
        <AppText variant="caption" color={colors.textMuted}>
          {unit}
        </AppText>
      </View>
      <StepButton label="+" onPress={() => update(value + step)} accessibilityLabel={`${accessibilityLabel} +${step}`} />
    </View>
  );
}

function StepButton({ label, onPress, accessibilityLabel }: { label: string; onPress: () => void; accessibilityLabel: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.step, pressed && styles.pressed]}
    >
      <AppText variant="heading" color={colors.accent}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: spacing.xs },
  input: {
    ...typography.title,
    color: colors.text,
    minWidth: 64,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  step: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
