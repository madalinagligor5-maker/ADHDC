import { StyleSheet, View } from 'react-native';

import { scoreTier } from '@/domain/score';
import { colors, radius, spacing, tierColor } from '@/theme';
import { AppText } from './AppText';

export interface WeekChartPoint {
  key: string;
  label: string;
  score: number | null;
  highlight?: boolean;
}

const CHART_HEIGHT = 140;

/** Seven vertical bars, one per day. Days without data render as a dash. */
export function WeekChart({ points, emptyLabel }: { points: WeekChartPoint[]; emptyLabel: string }) {
  return (
    <View style={styles.row}>
      {points.map((point) => {
        const height = point.score === null ? 4 : Math.max(6, (point.score / 100) * CHART_HEIGHT);
        const color = point.score === null ? colors.surfaceAlt : tierColor(scoreTier(point.score));
        return (
          <View
            key={point.key}
            style={styles.column}
            accessible
            accessibilityLabel={`${point.label}: ${point.score ?? emptyLabel}`}
          >
            <AppText variant="caption" color={colors.textMuted}>
              {point.score ?? emptyLabel}
            </AppText>
            <View style={styles.track}>
              <View style={[styles.bar, { height, backgroundColor: color }]} />
            </View>
            <AppText variant="caption" color={point.highlight ? colors.accent : colors.textMuted}>
              {point.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  column: { flex: 1, alignItems: 'center', gap: spacing.xs },
  track: { height: CHART_HEIGHT, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '70%', borderRadius: radius.sm },
});
