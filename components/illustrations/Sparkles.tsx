import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme';

interface SparklesProps {
  size?: number;
  color?: string;
}

/** A small cluster of four-point sparkles for celebrations and accents. */
export function Sparkles({ size = 28, color }: SparklesProps) {
  const theme = useTheme();
  const fill = color ?? theme.colors.mustard;

  // Four-point sparkle centered at (cx, cy) with the given radius.
  const star = (cx: number, cy: number, r: number) =>
    `M${cx} ${cy - r} C${cx + r * 0.18} ${cy - r * 0.18} ${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy} ` +
    `C${cx + r * 0.18} ${cy + r * 0.18} ${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r} ` +
    `C${cx - r * 0.18} ${cy + r * 0.18} ${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy} ` +
    `C${cx - r * 0.18} ${cy - r * 0.18} ${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r} Z`;

  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" accessibilityRole="image">
      <Path d={star(22, 16, 12)} fill={fill} />
      <Path d={star(9, 9, 6)} fill={fill} opacity={0.85} />
      <Path d={star(11, 30, 5)} fill={fill} opacity={0.7} />
    </Svg>
  );
}
