import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

interface PlantProps {
  size?: number;
  /** 0..1 focus progress; mapped to five growth stages when `stage` is absent. */
  progress?: number;
  /** Explicit growth stage 0..4 (overrides `progress`). */
  stage?: number;
}

function clampStage(value: number): number {
  return Math.max(0, Math.min(4, Math.round(value)));
}

/**
 * A pot with a plant that grows through five stages (seed → bloom). Used to
 * visualize focus-session progress and gamified rewards.
 */
export function Plant({ size = 120, progress = 0, stage }: PlantProps) {
  const theme = useTheme();
  const resolved = clampStage(stage ?? progress * 4);

  const green = theme.colors.success;
  const leaf = theme.colors.teal;
  const bloom = theme.colors.mustard;
  const petal = theme.colors.coral;
  const pot = theme.colors.coral;
  const soil = theme.dark ? '#3A2E2A' : '#7A5A48';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 120" accessibilityRole="image">
      {/* Pot */}
      <Path d="M28 96 L72 96 L66 118 L34 118 Z" fill={pot} />
      <Path d="M26 90 L74 90 L72 98 L28 98 Z" fill={pot} opacity={0.85} />
      <Ellipse cx="50" cy="91" rx="23" ry="4.5" fill={soil} />

      {resolved === 0 && <Circle cx="50" cy="89" r="3" fill={green} />}

      {resolved >= 1 && (
        <G>
          {/* Stem grows taller with each stage */}
          <Path
            d={`M50 90 L50 ${90 - resolved * 14}`}
            stroke={green}
            strokeWidth={4}
            strokeLinecap="round"
          />
          {/* First pair of leaves */}
          <Ellipse cx="40" cy={84} rx="9" ry="5" fill={leaf} transform="rotate(-28 40 84)" />
          {resolved >= 2 && (
            <Ellipse cx="60" cy={78} rx="9" ry="5" fill={leaf} transform="rotate(28 60 78)" />
          )}
          {resolved >= 3 && (
            <>
              <Ellipse cx="38" cy={66} rx="8" ry="4.5" fill={green} transform="rotate(-32 38 66)" />
              <Ellipse cx="62" cy={60} rx="8" ry="4.5" fill={green} transform="rotate(32 62 60)" />
            </>
          )}
        </G>
      )}

      {resolved >= 4 && (
        <G>
          {/* Bloom */}
          {[0, 72, 144, 216, 288].map((angle) => (
            <Ellipse
              key={angle}
              cx="50"
              cy="28"
              rx="6"
              ry="11"
              fill={petal}
              transform={`rotate(${angle} 50 36)`}
            />
          ))}
          <Circle cx="50" cy="36" r="7" fill={bloom} />
        </G>
      )}
    </Svg>
  );
}
