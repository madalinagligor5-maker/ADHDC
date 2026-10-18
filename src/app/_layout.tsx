import { DarkTheme, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { ErrorState, LoadingState, Screen } from '@/components';
import { useHydrated } from '@/store/useAppStore';
import { colors } from '@/theme';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.accent,
    text: colors.text,
  },
};

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <Screen scroll={false} contentStyle={{ justifyContent: 'center' }}>
      <ErrorState onRetry={retry} />
    </Screen>
  );
}

export default function RootLayout() {
  const hydrated = useHydrated();

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      {hydrated ? (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
          <Stack.Screen name="score" />
          <Stack.Screen name="manual-entry" options={{ presentation: 'modal' }} />
          <Stack.Screen name="focus" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        </Stack>
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <LoadingState />
        </View>
      )}
    </ThemeProvider>
  );
}
