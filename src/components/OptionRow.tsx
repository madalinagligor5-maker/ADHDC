import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

interface OptionRowProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  accentColor?: string;
}

/** A large, tappable row with a checkmark. Used for multi-select lists. */
export function OptionRow({ title, subtitle, selected, onPress, accentColor = colors.accent }: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={[styles.swatch, { backgroundColor: accentColor }]} />
      <View style={styles.text}>
        <AppText variant="heading">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.textMuted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.check, selected && styles.checkOn]}>
        {selected ? (
          <AppText variant="label" color={colors.onAccent}>
            ✓
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 64,
  },
  selected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  pressed: { opacity: 0.85 },
  swatch: { width: 12, height: 12, borderRadius: 6 },
  text: { flex: 1 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.accent },
});
