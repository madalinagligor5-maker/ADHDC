import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function icon(name: IconName) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={String(color)} size={size} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const strings = useStrings();
  const onboarded = useAppStore((state) => state.onboarded);

  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: strings.tabs.home, tabBarIcon: icon('pulse') }} />
      <Tabs.Screen name="challenges" options={{ title: strings.tabs.challenges, tabBarIcon: icon('flag') }} />
      <Tabs.Screen name="history" options={{ title: strings.tabs.history, tabBarIcon: icon('bar-chart') }} />
      <Tabs.Screen name="settings" options={{ title: strings.tabs.settings, tabBarIcon: icon('settings') }} />
    </Tabs>
  );
}
