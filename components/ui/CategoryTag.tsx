import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Text } from './Text';

interface CategoryTagProps {
  label: string;
  /** Category accent color (e.g. Work/School/Personal). */
  color: string;
  icon?: ReactNode;
}

/** A soft-tinted tag with a colored dot/icon for task categories. */
export function CategoryTag({ label, color, icon }: CategoryTagProps) {
  const theme = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: theme.colors.surfaceAlt }]}>
      {icon ?? <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
