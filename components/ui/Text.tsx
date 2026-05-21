import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme, type ThemeColors } from '@/theme';

type Variant = 'h1' | 'h2' | 'title' | 'body' | 'bodyStrong' | 'caption';

export interface AppTextProps extends RNTextProps {
  variant?: Variant;
  color?: keyof ThemeColors;
  center?: boolean;
}

/** Themed text primitive — the only place screens get typography + color from. */
export function Text({ variant = 'body', color = 'text', center, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const base = theme.typography[variant] as TextStyle;
  return (
    <RNText
      style={[base, { color: theme.colors[color] }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
