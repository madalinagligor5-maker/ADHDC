import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, MinutesStepper, Screen, ScreenHeader } from '@/components';
import { APPS, totalMinutes, type UsageMap } from '@/domain/apps';
import { useToday } from '@/hooks/useToday';
import { formatDuration, useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

/** Manual mode: the user types today's minutes per app. Fully offline. */
export default function ManualEntry() {
  const strings = useStrings();
  const s = strings.manual;
  const { date, day, settings } = useToday();
  const setUsage = useAppStore((state) => state.setUsage);
  const [usage, setLocalUsage] = useState<UsageMap>(() => ({ ...day?.usage }));

  const save = () => {
    setUsage(date, usage, 'manual');
    router.back();
  };

  return (
    <Screen footer={<Button label={strings.common.save} onPress={save} />}>
      <ScreenHeader title={s.title} modal />
      <AppText variant="body" color={colors.textMuted}>
        {s.subtitle}
      </AppText>
      {day?.source === 'auto' && day.hasUsage ? (
        <Card>
          <AppText variant="caption" color={colors.textMuted}>
            {s.autoNotice}
          </AppText>
        </Card>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        {settings.trackedApps.map((id) => (
          <Card key={id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: APPS[id].color }} />
              <AppText variant="heading">{APPS[id].name}</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {APPS[id].feed}
              </AppText>
            </View>
            <MinutesStepper
              value={usage[id] ?? 0}
              onChange={(value) => setLocalUsage((current) => ({ ...current, [id]: value }))}
              unit={s.minutes}
              accessibilityLabel={APPS[id].name}
            />
          </Card>
        ))}
      </View>

      <AppText variant="heading" align="center">
        {strings.dashboard.totalToday}: {formatDuration(totalMinutes(usage, settings.trackedApps), strings)}
      </AppText>
    </Screen>
  );
}
