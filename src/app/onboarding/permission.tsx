import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components';
import type { ScreenTimeMode } from '@/domain/types';
import { format, useStrings } from '@/i18n';
import { automaticProvider } from '@/services/screenTime';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

/** Onboarding 3 — explain, then (optionally) ask for screen-time access. */
export default function OnboardingPermission() {
  const strings = useStrings();
  const s = strings.onboarding;
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const availability = automaticProvider.getAvailability();
  const [waitingForSettings, setWaitingForSettings] = useState(false);
  const [checking, setChecking] = useState(false);

  const finish = useCallback(
    (mode: ScreenTimeMode) => {
      completeOnboarding(mode);
      router.replace('/');
    },
    [completeOnboarding],
  );

  const allow = async () => {
    setChecking(true);
    try {
      const result = await automaticProvider.requestPermission();
      if (result === 'granted') finish('auto');
      else if (result === 'denied') setWaitingForSettings(true);
      else finish('manual');
    } catch {
      finish('manual');
    } finally {
      setChecking(false);
    }
  };

  // Android grants usage access in system settings; re-check when the user comes back.
  useEffect(() => {
    if (!waitingForSettings) return;
    const subscription = AppState.addEventListener('change', async (next) => {
      if (next !== 'active') return;
      const permission = await automaticProvider.getPermission().catch(() => 'denied' as const);
      if (permission === 'granted') finish('auto');
    });
    return () => subscription.remove();
  }, [waitingForSettings, finish]);

  return (
    <Screen
      footer={
        availability.available ? (
          <>
            <Button label={s.permissionAllow} onPress={allow} loading={checking} />
            <Button variant="ghost" label={s.permissionLater} onPress={() => finish('manual')} />
          </>
        ) : (
          <Button label={strings.common.continue} onPress={() => finish('manual')} />
        )
      }
    >
      <AppText variant="caption" color={colors.textMuted}>
        {format(s.step, { current: 3, total: 3 })}
      </AppText>
      <View style={styles.lock}>
        <AppText style={styles.emoji}>🔐</AppText>
      </View>
      <AppText variant="title" accessibilityRole="header">
        {s.permissionTitle}
      </AppText>
      <AppText variant="body" color={colors.textMuted}>
        {s.permissionBody}
      </AppText>

      {!availability.available ? (
        <Card>
          <AppText variant="body">{s.permissionUnavailable[availability.reason]}</AppText>
        </Card>
      ) : waitingForSettings ? (
        <Card style={styles.pending}>
          <AppText variant="body">{s.permissionPending}</AppText>
        </Card>
      ) : null}

      <AppText variant="caption" color={colors.textMuted}>
        {s.permissionManualNote}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lock: { alignItems: 'center', marginVertical: spacing.lg },
  emoji: { fontSize: 72, lineHeight: 84 },
  pending: { borderColor: colors.accent },
});
