import { StyleSheet, View } from 'react-native';

import { scoreTier } from '@/domain/score';
import { colors, tierColor } from '@/theme';
import { AppText } from './AppText';
import { ProgressRing } from './ProgressRing';

interface ScoreRingProps {
  /** `null` renders the unknown "?" state. */
  score: number | null;
  label: string;
  size?: number;
}

export function ScoreRing({ score, label, size = 220 }: ScoreRingProps) {
  const color = score === null ? colors.textFaint : tierColor(scoreTier(score));
  return (
    <View
      style={styles.center}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${score ?? '?'} / 100`}
    >
      <ProgressRing progress={score === null ? 0 : score / 100} size={size} color={color}>
        <AppText variant="caption" color={colors.textMuted}>
          {label}
        </AppText>
        <AppText style={[styles.score, { fontSize: size * 0.3, lineHeight: size * 0.34 }]} color={color}>
          {score ?? '?'}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          / 100
        </AppText>
      </ProgressRing>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  score: { fontWeight: '800' },
});
