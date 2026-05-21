import { Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

interface MoodFaceProps {
  level: MoodLevel;
  size?: number;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function MoodFace({
  level,
  size = 48,
  selected,
  onPress,
  accessibilityLabel,
}: MoodFaceProps) {
  const theme = useTheme();

  const colorByLevel: Record<MoodLevel, string> = {
    1: theme.colors.coral,
    2: theme.colors.mustard,
    3: theme.colors.mustard,
    4: theme.colors.teal,
    5: theme.colors.success,
  };
  const tint = colorByLevel[level];
  const face = '#2E2A5E';

  // -1 (frown) .. +1 (smile)
  const smile = (level - 3) / 2;
  const mouthControlY = 62 + smile * 12;
  const mouth = `M34 60 Q50 ${mouthControlY} 66 60`;

  const ring = selected ? 3 : 0;

  const svg = (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityRole="image">
      <Circle cx="50" cy="50" r={48 - ring} fill={tint} opacity={0.25} />
      {selected ? (
        <Circle cx="50" cy="50" r={48 - ring} stroke={tint} strokeWidth={ring} fill="none" />
      ) : null}
      <G fill={face}>
        <Circle cx="36" cy="42" r="5" />
        <Circle cx="64" cy="42" r="5" />
      </G>
      <Path d={mouth} stroke={face} strokeWidth={4} strokeLinecap="round" fill="none" />
    </Svg>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        hitSlop={6}
        style={styles.press}
      >
        {svg}
      </Pressable>
    );
  }
  return svg;
}

const styles = StyleSheet.create({
  press: { alignItems: 'center', justifyContent: 'center' },
});
