import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

/** Stylized two-lobe brain, drawn with strokes so it reads well at any size. */
export function BrainMark({ size = 72, color = colors.accent }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M31 10c-4-4-12-3-14 3-6 0-9 6-7 11-4 3-4 10 1 13-1 6 4 11 10 10 2 5 8 6 10 3V10z"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M33 10c4-4 12-3 14 3 6 0 9 6 7 11 4 3 4 10-1 13 1 6-4 11-10 10-2 5-8 6-10 3V10z"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path d="M18 24c4 0 6 3 6 6M46 24c-4 0-6 3-6 6M20 40c3-2 7-1 8 2M44 40c-3-2-7-1-8 2" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}
