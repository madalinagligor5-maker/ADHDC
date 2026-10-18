import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  MinutesStepper,
  OptionRow,
  Screen,
  ScreenHeader,
  SectionTitle,
  Segmented,
} from '@/components';
import { APP_IDS, APPS, type AppId } from '@/domain/apps';
import type { Language, ScreenTimeMode } from '@/domain/types';
import { useScreenTimeSync } from '@/hooks/useScreenTimeSync';
import { format, getStrings, useStrings } from '@/i18n';
import { disableDailyReminder, enableDailyReminder, notificationsSupported } from '@/services/notifications';
import { automaticProvider } from '@/services/screenTime';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';
import { confirm } from '@/utils/confirm';

export default function SettingsScreen() {
  const strings = useStrings();
  const s = strings.settings;
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const resetAll = useAppStore((state) => state.resetAll);
  const { permission, sync } = useScreenTimeSync();
  const [notificationsDenied, setNotificationsDenied] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const availability = automaticProvider.getAvailability();

  const toggleApp = (id: AppId) => {
    const selected = settings.trackedApps.includes(id);
    if (selected && settings.trackedApps.length === 1) return;
    updateSettings({
      trackedApps: selected ? settings.trackedApps.filter((app) => app !== id) : [...settings.trackedApps, id],
    });
  };

  const changeLanguage = async (language: Language) => {
    updateSettings({ language });
    // Re-schedule so the reminder text follows the new language.
    if (settings.notificationsEnabled) await enableDailyReminder(getStrings(language)).catch(() => false);
  };

  const changeMode = async (mode: ScreenTimeMode) => {
    updateSettings({ screenTimeMode: mode });
    if (mode === 'auto') {
      const result = await automaticProvider.requestPermission().catch(() => 'unavailable' as const);
      if (result === 'granted') sync();
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    setSavingNotifications(true);
    try {
      if (enabled) {
        const granted = await enableDailyReminder(strings);
        setNotificationsDenied(!granted);
        updateSettings({ notificationsEnabled: granted });
      } else {
        await disableDailyReminder();
        updateSettings({ notificationsEnabled: false });
      }
    } catch {
      setNotificationsDenied(true);
      updateSettings({ notificationsEnabled: false });
    } finally {
      setSavingNotifications(false);
    }
  };

  const confirmReset = async () => {
    const ok = await confirm({
      title: s.resetConfirmTitle,
      message: s.resetConfirmBody,
      confirmLabel: s.resetConfirm,
      cancelLabel: strings.common.cancel,
      destructive: true,
    });
    if (!ok) return;
    await disableDailyReminder();
    resetAll();
    router.replace('/onboarding');
  };

  const permissionLabel = !availability.available
    ? s.statusUnavailable
    : permission === 'granted'
      ? s.statusGranted
      : s.statusDenied;

  return (
    <Screen edges={['top']}>
      <ScreenHeader title={s.title} showBack={false} />

      <SectionTitle>{s.language}</SectionTitle>
      <Segmented
        value={settings.language}
        onChange={changeLanguage}
        options={[
          { value: 'ro', label: s.languages.ro },
          { value: 'en', label: s.languages.en },
        ]}
      />

      <SectionTitle>{s.dailyLimit}</SectionTitle>
      <Card>
        <AppText variant="caption" color={colors.textMuted}>
          {s.dailyLimitHint}
        </AppText>
        <MinutesStepper
          value={settings.dailyLimitMin}
          min={5}
          onChange={(value) => updateSettings({ dailyLimitMin: value })}
          unit={strings.manual.minutes}
          accessibilityLabel={s.dailyLimit}
        />
      </Card>

      <SectionTitle>{s.trackedApps}</SectionTitle>
      <View style={styles.list}>
        {APP_IDS.map((id) => (
          <OptionRow
            key={id}
            title={APPS[id].name}
            subtitle={APPS[id].feed}
            accentColor={APPS[id].color}
            selected={settings.trackedApps.includes(id)}
            onPress={() => toggleApp(id)}
          />
        ))}
      </View>

      <SectionTitle>{s.screenTime}</SectionTitle>
      <Card>
        <Segmented
          value={settings.screenTimeMode}
          onChange={changeMode}
          options={[
            { value: 'auto', label: s.modeAuto, disabled: !availability.available },
            { value: 'manual', label: s.modeManual },
          ]}
        />
        <AppText variant="caption" color={colors.textMuted}>
          {permissionLabel}
        </AppText>
        {!availability.available ? (
          <AppText variant="caption" color={colors.textMuted}>
            {strings.onboarding.permissionUnavailable[availability.reason]}
          </AppText>
        ) : settings.screenTimeMode === 'auto' && permission !== 'granted' ? (
          <Button variant="secondary" label={s.connect} onPress={() => changeMode('auto')} />
        ) : null}
      </Card>

      {notificationsSupported ? (
        <>
          <SectionTitle>{s.notifications}</SectionTitle>
          <Card>
            <View style={styles.switchRow}>
              <AppText variant="body" style={styles.flex}>
                {s.notificationsHint}
              </AppText>
              <Switch
                accessibilityLabel={s.notifications}
                value={settings.notificationsEnabled}
                disabled={savingNotifications}
                onValueChange={toggleNotifications}
                trackColor={{ true: colors.accent, false: colors.surfaceAlt }}
                thumbColor={colors.text}
              />
            </View>
            {notificationsDenied ? (
              <AppText variant="caption" color={colors.coral}>
                {s.notificationsDenied}
              </AppText>
            ) : null}
          </Card>
        </>
      ) : null}

      <SectionTitle>{s.plus}</SectionTitle>
      <Card onPress={() => router.push('/paywall')}>
        <AppText variant="heading">✨ {s.plus}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {s.plusHint}
        </AppText>
      </Card>

      <SectionTitle>{s.privacy}</SectionTitle>
      <Card>
        <AppText variant="body">🔒 {s.privacyBody}</AppText>
      </Card>

      <Button variant="ghost" label={s.reset} onPress={confirmReset} />
      <AppText variant="caption" align="center" color={colors.textFaint}>
        {format(s.version, { v: Constants.expoConfig?.version ?? '1.0.0' })}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
});
