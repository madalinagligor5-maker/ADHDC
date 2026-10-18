import { StyleSheet, View } from 'react-native';

import type { Challenge } from '@/domain/challenges';
import { SCORE_RULES } from '@/domain/score';
import { format, useStrings } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';

interface ChallengeCardProps {
  challenge: Challenge;
  completed?: boolean;
  /** Locked cards preview Plus content and have no actions. */
  locked?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  compact?: boolean;
}

export function ChallengeCard({
  challenge,
  completed = false,
  locked = false,
  onToggle,
  onPress,
  compact = false,
}: ChallengeCardProps) {
  const strings = useStrings();
  const text = strings.challenges.items[challenge.id];

  return (
    <Card onPress={onPress} style={locked ? styles.locked : completed ? styles.completed : undefined}>
      <View style={styles.header}>
        <AppText variant="heading">{locked ? '🔒' : challenge.emoji}</AppText>
        <View style={styles.pill}>
          <AppText variant="caption" color={colors.textMuted}>
            {strings.challenges.categories[challenge.category]}
          </AppText>
        </View>
        <View style={styles.spacer} />
        <AppText variant="caption" color={completed ? colors.accent : colors.textMuted}>
          {completed
            ? `✓ ${strings.challenges.completed}`
            : format(strings.challenges.bonus, { n: SCORE_RULES.challengeBonus })}
        </AppText>
      </View>
      <AppText variant="heading">{text.title}</AppText>
      {!compact ? (
        <AppText variant="body" color={colors.textMuted}>
          {text.description}
        </AppText>
      ) : null}
      {onToggle && !locked ? (
        <Button
          variant={completed ? 'ghost' : 'secondary'}
          label={completed ? strings.challenges.undo : strings.challenges.complete}
          onPress={onToggle}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spacer: { flex: 1 },
  pill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  completed: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  locked: { opacity: 0.55 },
});
