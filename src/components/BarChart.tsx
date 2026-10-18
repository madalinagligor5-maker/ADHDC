import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

export interface BarPoint {
  key: string;
  label: string;
  /** `null` = no data; rendered as a dash, never as a zero-height bar. */
  value: number | null;
  /** Optional per-bar reference, drawn as a dotted line (e.g. that day's limit). */
  reference?: number | null;
  /** Spoken description for screen readers. */
  accessibilityLabel: string;
  highlight?: boolean;
}

interface BarChartProps {
  points: BarPoint[];
  color: string;
  /** Bars above this value use `overColor` (e.g. over the day's limit). */
  overColor?: string;
  formatValue: (value: number) => string;
  height?: number;
  /** Fixed maximum (e.g. 100 for scores); otherwise derived from data. */
  max?: number;
}

export function BarChart({ points, color, overColor, formatValue, height = 140, max }: BarChartProps) {
  const dataMax = Math.max(1, ...points.map((p) => Math.max(p.value ?? 0, p.reference ?? 0)));
  const top = max ?? dataMax * 1.1;
  const dense = points.length > 10;

  return (
    <View style={styles.row} accessibilityRole="list">
      {points.map((point) => {
        const over = overColor && point.value !== null && point.reference != null && point.value > point.reference;
        const barHeight = point.value === null ? 0 : Math.max(2, (point.value / top) * height);
        return (
          <View key={point.key} style={styles.column} accessible accessibilityLabel={point.accessibilityLabel}>
            {!dense ? (
              <AppText variant="caption" color={point.value === null ? colors.textFaint : colors.textMuted} numberOfLines={1} allowFontScaling={false} style={styles.valueLabel}>
                {point.value === null ? '—' : formatValue(point.value)}
              </AppText>
            ) : null}
            <View style={[styles.track, { height }]}>
              {point.reference != null ? (
                <View style={[styles.reference, { bottom: (point.reference / top) * height }]} />
              ) : null}
              {point.value === null ? (
                // Dense charts hide the value row, so mark missing days inside the track instead.
                dense ? (
                  <AppText variant="caption" color={colors.textFaint} style={styles.noData}>
                    ·
                  </AppText>
                ) : null
              ) : (
                <View style={[styles.bar, { height: barHeight, backgroundColor: over ? overColor : color }]} />
              )}
            </View>
            {!dense || point.highlight ? (
              <AppText variant="caption" color={point.highlight ? colors.text : colors.textMuted} numberOfLines={1} allowFontScaling={false} style={styles.valueLabel}>
                {point.label}
              </AppText>
            ) : (
              <View style={styles.labelSpacer} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
  column: { flex: 1, alignItems: 'center', gap: spacing.xs, minWidth: 0 },
  track: { width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '64%', borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm, minWidth: 3 },
  reference: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
  },
  noData: { marginBottom: 2 },
  valueLabel: { fontSize: 11, lineHeight: 14 },
  labelSpacer: { height: 14 },
});
