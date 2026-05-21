import { StyleSheet, View } from 'react-native';

import { Mascot, type MascotMood } from '@/components/illustrations';
import { useTheme } from '@/theme';
import { Button } from './Button';
import { Text } from './Text';

interface EmptyStateProps {
  title: string;
  message?: string;
  mood?: MascotMood;
  actionLabel?: string;
  onAction?: () => void;
}

/** Friendly empty state — mascot + encouraging copy, never a cold blank screen. */
export function EmptyState({
  title,
  message,
  mood = 'encouraging',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { gap: theme.spacing.md }]}>
      <Mascot mood={mood} size={104} />
      <Text variant="title" center>
        {title}
      </Text>
      {message ? (
        <Text variant="body" color="textMuted" center>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  action: { marginTop: 8 },
});
