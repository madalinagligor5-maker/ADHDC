import { useId, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { brandGradient, colors } from '@/theme';

interface ProgressRingProps {
  /** 0..1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** A solid color; when omitted the ring uses the cyan → mint brand gradient. */
  color?: string;
  trackColor?: string;
  /** Soft outer glow in the ring color. */
  glow?: boolean;
  children?: ReactNode;
}

export function ProgressRing({
  progress,
  size = 220,
  strokeWidth = 14,
  color,
  trackColor = colors.surfaceAlt,
  glow = false,
  children,
}: ProgressRingProps) {
  const gradientId = `ring-${useId().replace(/:/g, '')}`;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const glowColor = color ?? brandGradient[0];

  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        glow && { shadowColor: glowColor, shadowOpacity: 0.55, shadowRadius: 24, shadowOffset: { width: 0, height: 0 } },
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={brandGradient[0]} />
            <Stop offset="1" stopColor={brandGradient[1]} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        {clamped > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color ?? `url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - clamped)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
