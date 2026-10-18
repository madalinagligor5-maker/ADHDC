import { Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '@/theme';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function AppText({
  variant = 'body',
  color = colors.text,
  align,
  style,
  ...rest
}: AppTextProps) {
  return <Text style={[typography[variant], { color, textAlign: align }, style]} {...rest} />;
}
