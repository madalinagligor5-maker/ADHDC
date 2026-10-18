import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { Platform, type ColorValue } from 'react-native';

import { useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts } from '@/theme';

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
  const demo = useAppStore((state) => state.demo);

  // Demo mode can be explored before onboarding; real use requires it.
  if (!onboarded && !demo) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.action,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [
          { backgroundColor: colors.background, borderTopColor: colors.border },
          // Web has no safe-area inset, so give the labels room explicitly.
          Platform.OS === 'web' && { height: 68, paddingTop: 4, paddingBottom: 6 },
        ],
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: strings.tabs.home, tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="history" options={{ title: strings.tabs.progress, tabBarIcon: icon('stats-chart-outline') }} />
      <Tabs.Screen name="pause" options={{ title: strings.tabs.pause, tabBarIcon: icon('pause-circle-outline') }} />
      <Tabs.Screen name="settings" options={{ title: strings.tabs.settings, tabBarIcon: icon('settings-outline') }} />
    </Tabs>
  );
}
