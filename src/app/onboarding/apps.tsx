import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, ChoiceRow, Notice, Screen, StepHeader } from '@/components';
import { APP_IDS, type AppId } from '@/domain/apps';
import { appName, useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

/** Onboarding 3 — apps to use more intentionally. */
export default function Apps() {
  const strings = useStrings();
  const s = strings.onboarding;
  const tracked = useAppStore((state) => state.settings.trackedApps);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const toggle = (id: AppId) => {
    const next = tracked.includes(id) ? tracked.filter((app) => app !== id) : [...tracked, id];
    // At least one app stays selected; the store also guards this.
    if (next.length > 0) updateSettings({ trackedApps: next });
  };

  return (
    <Screen footer={<Button label={strings.common.continue} disabled={tracked.length === 0} onPress={() => router.push('/onboarding/limit')} />}>
      <StepHeader current={2} total={4} />
      <AppText variant="title" accessibilityRole="header">
        {s.appsTitle}
      </AppText>
      <View style={{ gap: spacing.sm }}>
        {APP_IDS.map((id) => (
          <ChoiceRow
            key={id}
            mode="checkbox"
            title={appName(id, strings)}
            selected={tracked.includes(id)}
            onPress={() => toggle(id)}
          />
        ))}
      </View>
      <Notice>{s.appsNote}</Notice>
      {tracked.length === 0 ? (
        <AppText variant="caption" color={colors.warning}>
          {s.appsEmpty}
        </AppText>
      ) : null}
    </Screen>
  );
}
