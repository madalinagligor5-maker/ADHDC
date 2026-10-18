import { useEffect, useId, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { brandGradient, colors } from '@/theme';

interface ProgressRingProps {
  /** 0..1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Solid color; when omitted the ring uses the cyan → mint brand gradient. */
  color?: string;
  trackColor?: string;
  /** Very soft glow, meant for the score ring only. */
  glow?: boolean;
  /** Animate changes (skipped when the OS asks for reduced motion). */
  animated?: boolean;
  children?: ReactNode;
}

export function ProgressRing({
  progress,
  size = 220,
  strokeWidth = 14,
  color,
  trackColor = colors.surfaceRaised,
  glow = false,
  animated = false,
  children,
}: ProgressRingProps) {
  const gradientId = `ring-${useId().replace(/:/g, '')}`;
  const reducedMotion = useReducedMotion();
  const target = Math.max(0, Math.min(1, progress));
  const [shown, setShown] = useState(animated ? 0 : target);
  const [value] = useState(() => new Animated.Value(animated ? 0 : target));

  useEffect(() => {
    if (!animated || reducedMotion) {
      value.stopAnimation();
      value.setValue(target);
      return;
    }
    const id = value.addListener(({ value: next }) => setShown(next));
    Animated.timing(value, {
      toValue: target,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => value.removeListener(id);
  }, [animated, reducedMotion, target, value]);

  const current = !animated || reducedMotion ? target : shown;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        glow && {
          shadowColor: color ?? brandGradient[0],
          shadowOpacity: 0.28,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 0 },
        },
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
        {current > 0.001 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color ?? `url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - current)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 12 },
});
