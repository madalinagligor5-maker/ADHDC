import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ErrorState, LoadingState, Screen } from '@/components';
import { useHydrated } from '@/store/useAppStore';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
  const [fontsLoaded, fontError] = useFonts({
    [fonts.heading]: Outfit_700Bold,
    [fonts.body]: Inter_400Regular,
    [fonts.bodySemiBold]: Inter_600SemiBold,
  });
  // If fonts fail to load we still start, with system fonts.
  const ready = hydrated && (fontsLoaded || fontError !== null);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      {ready ? (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
          <Stack.Screen name="score" />
          <Stack.Screen name="challenges" />
          <Stack.Screen name="manual-entry" options={{ presentation: 'modal' }} />
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
