import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  ChoiceRow,
  DemoBanner,
  LimitPicker,
  Notice,
  Screen,
  ScreenHeader,
  SectionTitle,
  Segmented,
} from '@/components';
import { APP_IDS, type AppId } from '@/domain/apps';
import { PURPOSES, type Language, type ScreenTimeMode } from '@/domain/types';
import { usePlan } from '@/hooks/usePlan';
import { useScreenTimeSync } from '@/hooks/useScreenTimeSync';
import { appName, format, getStrings, useStrings } from '@/i18n';
import { exportData } from '@/services/exportData';
import { disableDailyReminder, enableDailyReminder, notificationsSupported } from '@/services/notifications';
import { nativeUsageProvider } from '@/services/screenTime';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';
import { confirm } from '@/utils/confirm';

type Status = { tone: 'success' | 'warning'; text: string } | null;

export default function SettingsScreen() {
  const strings = useStrings();
  const s = strings.settings;
  const plan = usePlan();
  const settings = useAppStore((state) => state.settings);
  const devPlus = useAppStore((state) => state.devPlus);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const setDevPlus = useAppStore((state) => state.setDevPlus);
  const resetAll = useAppStore((state) => state.resetAll);
  const { permission, sync } = useScreenTimeSync();
  const availability = nativeUsageProvider.getAvailability();
  const [notificationsDenied, setNotificationsDenied] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [exportStatus, setExportStatus] = useState<Status>(null);

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
      const result = await nativeUsageProvider.requestPermission().catch(() => 'unavailable' as const);
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

  const runExport = async () => {
    try {
      await exportData();
      setExportStatus({ tone: 'success', text: s.exportDone });
    } catch {
      setExportStatus({ tone: 'warning', text: s.exportError });
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

  return (
    <Screen edges={['top']}>
      <DemoBanner />
      <ScreenHeader title={s.title} showBack={false} />

      <SectionTitle>{s.language}</SectionTitle>
      <Segmented
        accessibilityLabel={s.language}
        value={settings.language}
        onChange={changeLanguage}
        options={[
          { value: 'ro', label: s.languages.ro },
          { value: 'en', label: s.languages.en },
        ]}
      />

      <SectionTitle>{s.dailyGoal}</SectionTitle>
      <Card>
        <LimitPicker
          value={settings.dailyLimitMin}
          onChange={(value) => value !== null && updateSettings({ dailyLimitMin: value })}
        />
        <AppText variant="caption" color={colors.textMuted}>
          {s.dailyGoalHint}
        </AppText>
      </Card>

      <SectionTitle>{s.purpose}</SectionTitle>
      <View style={styles.list} accessibilityRole="radiogroup">
        {PURPOSES.map((id) => (
          <ChoiceRow
            key={id}
            title={strings.purposes[id]}
            selected={settings.purpose === id}
            onPress={() => updateSettings({ purpose: id })}
          />
        ))}
      </View>

      <SectionTitle>{s.trackedApps}</SectionTitle>
      <View style={styles.list}>
        {APP_IDS.map((id) => (
          <ChoiceRow
            key={id}
            mode="checkbox"
            title={appName(id, strings)}
            selected={settings.trackedApps.includes(id)}
            onPress={() => toggleApp(id)}
          />
        ))}
      </View>
      <Notice>{strings.onboarding.appsNote}</Notice>

      <SectionTitle>{s.dataSource}</SectionTitle>
      <Card>
        {availability.available ? (
          <>
            <Segmented
              accessibilityLabel={s.dataSource}
              value={settings.screenTimeMode}
              onChange={changeMode}
              options={[
                { value: 'manual', label: s.dataManual },
                { value: 'auto', label: s.dataAuto },
              ]}
            />
            {settings.screenTimeMode === 'auto' ? (
              <>
                <AppText variant="caption" color={permission === 'granted' ? colors.progress : colors.textMuted}>
                  {permission === 'granted' ? s.permissionGranted : s.permissionDenied}
                </AppText>
                {permission !== 'granted' ? (
                  <Button variant="secondary" label={s.openAccess} onPress={() => changeMode('auto')} />
                ) : null}
              </>
            ) : null}
          </>
        ) : (
          <>
            <AppText variant="label">{s.dataManual}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {strings.onboarding.sourceUnavailable[availability.reason]}
            </AppText>
          </>
        )}
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
                trackColor={{ true: colors.action, false: colors.surfaceRaised }}
                thumbColor={colors.text}
              />
            </View>
            {notificationsDenied ? (
              <AppText variant="caption" color={colors.warning}>
                {s.notificationsDenied}
              </AppText>
            ) : null}
          </Card>
        </>
      ) : null}

      <SectionTitle>{s.plan}</SectionTitle>
      <Card onPress={() => router.push('/paywall')} accessibilityHint={s.seeOffer}>
        <AppText variant="heading">{plan === 'plus' ? s.planPlus : s.planFree}</AppText>
        <AppText variant="label" color={colors.action}>
          {s.seeOffer}
        </AppText>
      </Card>

      <SectionTitle>{s.dataTitle}</SectionTitle>
      <Card>
        <Button variant="secondary" label={s.export} onPress={runExport} />
        {exportStatus ? <Notice tone={exportStatus.tone}>{exportStatus.text}</Notice> : null}
        <Button variant="danger" label={s.reset} onPress={confirmReset} />
      </Card>

      <SectionTitle>{s.privacy}</SectionTitle>
      <Card>
        <AppText variant="body">{s.privacySummary}</AppText>
        <LinkRow label={s.privacyPolicy} onPress={() => router.push('/privacy')} />
        <LinkRow label={s.terms} onPress={() => router.push('/terms')} />
      </Card>

      {__DEV__ ? (
        <>
          <SectionTitle>{s.developer}</SectionTitle>
          <Card>
            <View style={styles.switchRow}>
              <View style={styles.flex}>
                <AppText variant="body">{s.devPlus}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {s.devPlusHint}
                </AppText>
              </View>
              <Switch
                accessibilityLabel={s.devPlus}
                value={devPlus}
                onValueChange={setDevPlus}
                trackColor={{ true: colors.action, false: colors.surfaceRaised }}
                thumbColor={colors.text}
              />
            </View>
          </Card>
        </>
      ) : null}

      <AppText variant="caption" align="center" color={colors.textFaint}>
        {`${strings.common.tagline} · ${format(s.version, { v: Constants.expoConfig?.version ?? '—' })}`}
      </AppText>
    </Screen>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={styles.link}>
      <AppText variant="label" color={colors.action}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  link: { minHeight: 44, justifyContent: 'center' },
});
