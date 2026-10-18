import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, View } from 'react-native';

import { AppText, Button, ChoiceRow, Notice, Screen, StepHeader } from '@/components';
import type { ScreenTimeMode } from '@/domain/types';
import { useStrings } from '@/i18n';
import { nativeUsageProvider, type UsagePermission } from '@/services/screenTime';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

/**
 * Onboarding 5 — data source. The automatic option is only offered when the
 * native integration exists on this device; permission is requested only after
 * the user taps the button. Refusal keeps the app fully usable in manual mode.
 */
export default function Source() {
  const strings = useStrings();
  const s = strings.onboarding;
  const settings = useAppStore((state) => state.settings);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const availability = nativeUsageProvider.getAvailability();
  const [mode, setMode] = useState<ScreenTimeMode>('manual');
  const [permission, setPermission] = useState<UsagePermission | null>(null);
  const [requesting, setRequesting] = useState(false);

  const refresh = useCallback(async () => {
    if (!availability.available) return;
    setPermission(await nativeUsageProvider.getPermission().catch((): UsagePermission => 'unavailable'));
  }, [availability.available]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  const requestAccess = async () => {
    setRequesting(true);
    try {
      setPermission(await nativeUsageProvider.requestPermission());
    } catch {
      setPermission('unavailable');
    } finally {
      setRequesting(false);
    }
  };

  const finish = () => {
    // Without granted access we start in manual mode; it can be switched later in Settings.
    const finalMode: ScreenTimeMode = mode === 'auto' && permission === 'granted' ? 'auto' : 'manual';
    completeOnboarding({
      purpose: settings.purpose,
      trackedApps: settings.trackedApps,
      dailyLimitMin: settings.dailyLimitMin,
      screenTimeMode: finalMode,
    });
    router.replace('/');
  };

  return (
    <Screen footer={<Button label={s.finish} onPress={finish} />}>
      <StepHeader current={4} total={4} />
      <AppText variant="title" accessibilityRole="header">
        {s.sourceTitle}
      </AppText>

      <View style={{ gap: spacing.sm }} accessibilityRole="radiogroup">
        <ChoiceRow
          icon="create-outline"
          title={s.sourceManual}
          subtitle={s.sourceManualBody}
          selected={mode === 'manual'}
          onPress={() => setMode('manual')}
        />
        {availability.available ? (
          <ChoiceRow
            icon="phone-portrait-outline"
            title={s.sourceAuto}
            subtitle={s.sourceAutoBody}
            selected={mode === 'auto'}
            onPress={() => setMode('auto')}
          />
        ) : null}
      </View>

      {!availability.available ? <Notice>{s.sourceUnavailable[availability.reason]}</Notice> : null}

      {availability.available && mode === 'auto' ? (
        permission === 'granted' ? (
          <Notice tone="success">{s.sourceGranted}</Notice>
        ) : (
          <>
            <Button variant="secondary" label={s.sourceOpenSettings} onPress={requestAccess} loading={requesting} />
            {permission === 'denied' ? (
              <AppText variant="caption" color={colors.textMuted}>
                {`${s.sourceWaiting} ${s.sourceDenied}`}
              </AppText>
            ) : null}
          </>
        )
      ) : null}
    </Screen>
  );
}
