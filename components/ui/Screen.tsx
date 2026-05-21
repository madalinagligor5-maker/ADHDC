import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** Horizontal screen padding (defaults to spacing.xl). */
  padded?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
}

/** Consistent screen scaffold: themed background + safe-area handling. */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top'],
  contentStyle,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const padding = {
    paddingTop: edges.includes('top') ? insets.top + theme.spacing.md : theme.spacing.md,
    paddingBottom: edges.includes('bottom') ? insets.bottom + theme.spacing.md : theme.spacing.md,
    paddingHorizontal: padded ? theme.spacing.xl : 0,
  };

  if (scroll) {
    return (
      <ScrollView
        style={{ backgroundColor: theme.colors.bg }}
        contentContainerStyle={[padding, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg }, padding, contentStyle]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
