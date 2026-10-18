import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, OptionRow, Screen } from '@/components';
import { APP_IDS, APPS, ONBOARDING_APPS, type AppId } from '@/domain/apps';
import { format, useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

type Choice = AppId | 'all';

/** Onboarding 2 — which feeds to cut first. */
export default function OnboardingApps() {
  const strings = useStrings();
  const s = strings.onboarding;
  const updateSettings = useAppStore((state) => state.updateSettings);
  const saved = useAppStore((state) => state.settings.trackedApps);
  const [selected, setSelected] = useState<Choice[]>(() =>
    saved.length === APP_IDS.length ? ['all'] : saved.filter((id) => ONBOARDING_APPS.includes(id)),
  );

  const toggle = (choice: Choice) => {
    setSelected((current) => {
      if (choice === 'all') return current.includes('all') ? [] : ['all'];
      const withoutAll = current.filter((item) => item !== 'all');
      return withoutAll.includes(choice)
        ? withoutAll.filter((item) => item !== choice)
        : [...withoutAll, choice];
    });
  };

  const onContinue = () => {
    const apps = selected.includes('all') ? [...APP_IDS] : (selected as AppId[]);
    updateSettings({ trackedApps: apps });
    router.push('/onboarding/permission');
  };

  return (
    <Screen
      footer={
        <>
          {selected.length === 0 ? (
            <AppText variant="caption" align="center" color={colors.textMuted}>
              {s.appsEmpty}
            </AppText>
          ) : null}
          <Button tone="cyan" label={strings.common.continue} onPress={onContinue} disabled={selected.length === 0} />
        </>
      }
    >
      <AppText variant="caption" color={colors.textMuted}>
        {format(s.step, { current: 2, total: 3 })}
      </AppText>
      <AppText variant="title" accessibilityRole="header">
        {s.appsTitle}
      </AppText>
      <AppText variant="body" color={colors.textMuted}>
        {s.appsSubtitle}
      </AppText>
      <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
        {ONBOARDING_APPS.map((id) => (
          <OptionRow
            key={id}
            title={`${APPS[id].name} ${APPS[id].feed}`}
            accentColor={APPS[id].color}
            selected={selected.includes(id) || selected.includes('all')}
            onPress={() => toggle(id)}
          />
        ))}
        <OptionRow
          title={s.appsAll}
          subtitle={s.appsAllHint}
          selected={selected.includes('all')}
          onPress={() => toggle('all')}
        />
      </View>
    </Screen>
  );
}
