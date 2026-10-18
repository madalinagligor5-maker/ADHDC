import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors, fonts, palette } from '@/theme';
import { AppText } from './AppText';

interface LogoMarkProps {
  size?: number;
  /** `mono` renders the solid single-color variant. */
  mono?: string;
}

/** The ScrollFade "S" with pink speed lines. Same geometry as assets/logo-mark.svg. */
export function LogoMark({ size = 48, mono }: LogoMarkProps) {
  const gradientId = `sf-${useId().replace(/:/g, '')}`;
  const stroke = mono ?? `url(#${gradientId})`;
  const lines = mono ?? palette.pink;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="ScrollFade">
      <Defs>
        <LinearGradient id={gradientId} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={palette.cyan} />
          <Stop offset="1" stopColor={palette.mint} />
        </LinearGradient>
      </Defs>
      <G transform="translate(4 5) scale(0.9)">
        <G transform="skewX(-10) translate(10 0)">
          <Path
            d="M80 22 C 72 15, 61 13, 52 13 C 38 13, 31 21, 31 30 C 31 41, 42 44, 53 47 C 65 50, 73 54, 73 65 C 73 78, 62 86, 48 86 C 39 86, 31 84, 24 79"
            fill="none"
            stroke={stroke}
            strokeWidth={19}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
        <Rect x={2} y={47} width={22} height={7.5} rx={3.75} fill={lines} />
        <Rect x={8} y={59} width={18} height={7.5} rx={3.75} fill={lines} />
        <Rect x={3} y={71} width={14} height={7.5} rx={3.75} fill={lines} />
      </G>
    </Svg>
  );
}

/** Mark + wordmark, for headers and splash-like screens. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <View style={styles.row}>
      <LogoMark size={size} />
      <AppText style={{ fontFamily: fonts.heading, fontSize: size * 0.8, lineHeight: size }} color={colors.text}>
        ScrollFade
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
