import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { weekdayNarrow } from '@/utils/date';
import type { DailyMood } from '../selectors';

interface MoodTrendChartProps {
  data: DailyMood[];
  width: number;
  locale: string;
  height?: number;
}

const PAD_X = 14;
const PAD_Y = 16;

export function MoodTrendChart({ data, width, locale, height = 150 }: MoodTrendChartProps) {
  const theme = useTheme();
  const n = data.length;
  const innerW = Math.max(1, width - PAD_X * 2);
  const innerH = height - PAD_Y * 2;

  const x = (i: number) => PAD_X + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD_Y + ((5 - v) / 4) * innerH;

  // Build a line that breaks across days without an entry.
  let d = '';
  let penDown = false;
  data.forEach((point, i) => {
    if (point.average === null) {
      penDown = false;
      return;
    }
    const cmd = penDown ? 'L' : 'M';
    d += `${cmd}${x(i).toFixed(1)} ${y(point.average).toFixed(1)} `;
    penDown = true;
  });

  const labelEvery = Math.ceil(n / 7);

  return (
    <View>
      <Svg width={width} height={height}>
        {[1, 3, 5].map((level) => (
          <Line
            key={level}
            x1={PAD_X}
            y1={y(level)}
            x2={width - PAD_X}
            y2={y(level)}
            stroke={theme.colors.border}
            strokeWidth={1}
          />
        ))}
        {d ? <Path d={d.trim()} stroke={theme.colors.primary} strokeWidth={3} fill="none" /> : null}
        {data.map((point, i) =>
          point.average === null ? null : (
            <Circle key={i} cx={x(i)} cy={y(point.average)} r={4} fill={theme.colors.primary} />
          ),
        )}
      </Svg>
      <View style={[styles.labels, { paddingHorizontal: PAD_X }]}>
        {data.map((point, i) => (
          <Text key={i} variant="caption" color="textMuted" style={styles.label}>
            {i % labelEvery === 0 ? weekdayNarrow(point.date, locale) : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  label: { flex: 1, textAlign: 'center' },
});
