import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useStrings } from '@/i18n';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';

export function LoadingState({ label }: { label?: string }) {
  const strings = useStrings();
  return (
    <View style={styles.center} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.accent} />
      <AppText variant="caption" color={colors.textMuted}>
        {label ?? strings.common.loading}
      </AppText>
    </View>
  );
}

interface EmptyStateProps {
  emoji?: string;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji = '🌱', title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card style={styles.empty}>
      <AppText variant="title" align="center">
        {emoji}
      </AppText>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" align="center" color={colors.textMuted}>
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <Button variant="secondary" label={actionLabel} onPress={onAction} /> : null}
    </Card>
  );
}

interface ErrorStateProps {
  title?: string;
  body?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, body, onRetry }: ErrorStateProps) {
  const strings = useStrings();
  return (
    <Card style={[styles.empty, styles.error]}>
      <AppText variant="heading" align="center" color={colors.coral}>
        {title ?? strings.common.errorTitle}
      </AppText>
      <AppText variant="body" align="center" color={colors.textMuted}>
        {body ?? strings.common.errorBody}
      </AppText>
      {onRetry ? <Button variant="secondary" label={strings.common.retry} onPress={onRetry} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: colors.background },
  empty: { alignItems: 'stretch', paddingVertical: spacing.lg },
  error: { borderColor: colors.coral, backgroundColor: colors.coralSoft },
});
