import { ChevronRight } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Text } from './Text';

interface QuickActionRowProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Background tint for the icon bubble. */
  accent?: string;
  onPress: () => void;
}

export function QuickActionRow({ title, subtitle, icon, accent, onPress }: QuickActionRowProps) {
  const theme = useTheme();
  const bubble = accent ?? theme.colors.primarySoft;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
        },
        pressed && { opacity: 0.9 },
      ]}
    >
      {icon ? <View style={[styles.bubble, { backgroundColor: bubble }]}>{icon}</View> : null}
      <View style={styles.body}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color="textMuted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={20} color={theme.colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
});
