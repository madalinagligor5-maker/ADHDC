import { StyleSheet, View } from 'react-native';

import { scoreTier } from '@/domain/score';
import { colors, fonts, palette, tierColor } from '@/theme';
import { AppText } from './AppText';
import { ProgressRing } from './ProgressRing';

interface ScoreRingProps {
  /** `null` renders the unknown "?" state. */
  score: number | null;
  label: string;
  size?: number;
}

export function ScoreRing({ score, label, size = 220 }: ScoreRingProps) {
  const tier = score === null ? null : scoreTier(score);
  // Brand gradient for good scores; tier color (pink / coral) when brainrot is high.
  const ringColor = tier === null ? palette.cyan : tier === 'clean' || tier === 'good' ? undefined : tierColor(tier);
  const numberSize = size * 0.26;

  return (
    <View
      style={styles.center}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${score ?? '?'} / 100`}
    >
      <ProgressRing
        progress={score === null ? 1 : score / 100}
        size={size}
        strokeWidth={size * 0.07}
        color={ringColor}
        glow
      >
        <View style={styles.row}>
          <AppText style={{ fontFamily: fonts.heading, fontSize: numberSize, lineHeight: numberSize * 1.1 }}>
            {score ?? '?'}
          </AppText>
          <AppText
            style={{ fontFamily: fonts.heading, fontSize: numberSize * 0.5, lineHeight: numberSize * 0.6 }}
            color={colors.textMuted}
          >
            /100
          </AppText>
        </View>
        <AppText variant="body" color={colors.textMuted}>
          {label}
        </AppText>
      </ProgressRing>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'baseline' },
});
