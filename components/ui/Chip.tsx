import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Text } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
}

export function Chip({ label, selected = false, onPress, icon }: ChipProps) {
  const theme = useTheme();

  const bg = selected ? theme.colors.primary : theme.colors.surfaceAlt;
  const fg = selected ? 'onPrimary' : 'textMuted';

  const content = (
    <View style={styles.inner}>
      {icon}
      <Text variant="caption" color={fg}>
        {label}
      </Text>
    </View>
  );

  const base = [styles.chip, { backgroundColor: bg }];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [...base, pressed && { opacity: 0.85 }]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={base}>{content}</View>;
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
