import { StyleSheet, View } from 'react-native';

import { colors, fonts, palette } from '@/theme';
import { AppText } from './AppText';
import { ProgressRing } from './ProgressRing';

interface ScoreRingProps {
  /** `null` = no data: shows "?" and never a made-up value. */
  score: number | null;
  label: string;
  size?: number;
}

export function ScoreRing({ score, label, size = 220 }: ScoreRingProps) {
  const numberSize = size * 0.26;
  return (
    <View
      style={styles.center}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label}: ${score === null ? '?' : score} / 100`}
    >
      <ProgressRing
        progress={score === null ? 1 : score / 100}
        size={size}
        strokeWidth={Math.max(10, size * 0.065)}
        color={score === null ? palette.cyan : undefined}
        glow
        animated={score !== null}
      >
        <View style={styles.row}>
          <AppText
            allowFontScaling={false}
            style={{ fontFamily: fonts.heading, fontSize: numberSize, lineHeight: numberSize * 1.15 }}
          >
            {score === null ? '?' : score}
          </AppText>
          <AppText
            allowFontScaling={false}
            color={colors.textMuted}
            style={{ fontFamily: fonts.heading, fontSize: numberSize * 0.45, lineHeight: numberSize * 0.6 }}
          >
            /100
          </AppText>
        </View>
        <AppText variant="body" color={colors.textMuted} numberOfLines={1}>
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
