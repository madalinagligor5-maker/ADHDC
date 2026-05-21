import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

export type MascotMood = 'happy' | 'encouraging' | 'calm';

interface MascotProps {
  size?: number;
  mood?: MascotMood;
  /** Override the body color (defaults to the theme primary). */
  color?: string;
}

/**
 * Nimbus — ADHDCal's friendly cloud/blob mascot. Organic body, soft cheeks,
 * and three reassuring moods. Purely decorative, so it is hidden from a11y.
 */
export function Mascot({ size = 96, mood = 'happy', color }: MascotProps) {
  const theme = useTheme();
  const body = color ?? theme.colors.primary;
  const face = '#2E2A5E';
  const cheek = theme.colors.coral;

  // Organic blob body in a 100x100 canvas.
  const blob =
    'M50 6 C72 4 92 20 93 44 C94 62 86 80 66 88 C52 94 38 95 26 88 C10 78 5 60 8 42 C11 22 28 8 50 6 Z';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityRole="image">
      <Path d={blob} fill={body} />
      {/* Soft belly highlight */}
      <Ellipse cx="50" cy="60" rx="30" ry="24" fill="#FFFFFF" opacity={0.14} />

      {/* Cheeks */}
      <Circle cx="30" cy="58" r="6" fill={cheek} opacity={0.55} />
      <Circle cx="70" cy="58" r="6" fill={cheek} opacity={0.55} />

      {/* Eyes */}
      {mood === 'calm' ? (
        <G stroke={face} strokeWidth={3.2} strokeLinecap="round" fill="none">
          <Path d="M30 46 q5 5 10 0" />
          <Path d="M60 46 q5 5 10 0" />
        </G>
      ) : mood === 'encouraging' ? (
        <G>
          <Circle cx="35" cy="46" r="4.2" fill={face} />
          {/* Wink */}
          <Path
            d="M60 47 q5 -5 10 0"
            stroke={face}
            strokeWidth={3.2}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      ) : (
        <G fill={face}>
          <Circle cx="35" cy="45" r="4.2" />
          <Circle cx="65" cy="45" r="4.2" />
        </G>
      )}

      {/* Mouth */}
      {mood === 'encouraging' ? (
        <Path d="M38 60 q12 16 24 0 q-12 6 -24 0 Z" fill={face} />
      ) : (
        <Path
          d={mood === 'calm' ? 'M40 62 q10 8 20 0' : 'M38 60 q12 12 24 0'}
          stroke={face}
          strokeWidth={3.4}
          strokeLinecap="round"
          fill="none"
        />
      )}
    </Svg>
  );
}
