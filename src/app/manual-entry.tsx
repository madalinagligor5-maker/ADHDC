import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  Chip,
  Notice,
  NumberField,
  Screen,
  ScreenHeader,
  SectionTitle,
} from '@/components';
import { APP_IDS, totalMinutes, type AppId } from '@/domain/apps';
import { addDays, type DateKey } from '@/domain/date';
import { HISTORY_DAYS } from '@/domain/plans';
import { maxMinutesFor, toMinutes, type EntryError } from '@/domain/usage';
import { useTodayKey } from '@/hooks/useToday';
import { appName, format, formatDay, formatDuration, useLanguage, useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';
import { confirm } from '@/utils/confirm';

type FormError = EntryError | 'minutesRange';

/** Manual entry: one value per app per day. Saving an existing app replaces it. */
export default function ManualEntry() {
  const strings = useStrings();
  const language = useLanguage();
  const s = strings.manual;
  const today = useTodayKey();
  const params = useLocalSearchParams<{ date?: string }>();
  const demo = useAppStore((state) => state.demo);
  const days = useAppStore((state) => state.days);
  const trackedApps = useAppStore((state) => state.settings.trackedApps);
  const setAppMinutes = useAppStore((state) => state.setAppMinutes);
  const deleteAppMinutes = useAppStore((state) => state.deleteAppMinutes);

  // Entries are allowed for the visible free history window (today and the 6 days before).
  const dayOptions = useMemo(
    () => Array.from({ length: HISTORY_DAYS.free }, (_, index) => addDays(today, -index)),
    [today],
  );
  const [date, setDate] = useState<DateKey>(
    params.date && dayOptions.includes(params.date) ? params.date : today,
  );
  const [app, setApp] = useState<AppId>(trackedApps[0]);
  const initialValue = days[date]?.usage[app];
  const [hours, setHours] = useState(initialValue === undefined ? '' : String(Math.floor(initialValue / 60)));
  const [minutes, setMinutes] = useState(initialValue === undefined ? '' : String(initialValue % 60));
  const [error, setError] = useState<FormError | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const day = days[date];
  const usage = useMemo(() => day?.usage ?? {}, [day]);
  const existing = usage[app];
  const appChoices = APP_IDS.filter((id) => trackedApps.includes(id) || usage[id] !== undefined);
  const entries = APP_IDS.filter((id) => usage[id] !== undefined);
  const dayTotal = totalMinutes(usage);

  const loadApp = (id: AppId, forDate: DateKey = date) => {
    const value = days[forDate]?.usage[id];
    setApp(id);
    setHours(value === undefined ? '' : String(Math.floor(value / 60)));
    setMinutes(value === undefined ? '' : String(value % 60));
    setError(null);
  };

  const save = () => {
    setMessage(null);
    const h = hours === '' ? 0 : Number(hours);
    const m = minutes === '' ? 0 : Number(minutes);
    if (!Number.isInteger(h) || !Number.isInteger(m)) return setError('invalid');
    if (m < 0 || m > 59) return setError('minutesRange');
    const total = toMinutes(h, m);
    const result = setAppMinutes(date, app, total);
    if (result) return setError(result);
    setError(null);
    setMessage(format(s.saved, { app: appName(app, strings), time: formatDuration(total, strings) }));
  };

  const remove = async (id: AppId) => {
    const value = usage[id];
    if (value === undefined) return;
    const ok = await confirm({
      title: s.deleteConfirmTitle,
      message: format(s.deleteConfirmBody, { app: appName(id, strings), time: formatDuration(value, strings) }),
      confirmLabel: strings.common.delete,
      cancelLabel: strings.common.cancel,
      destructive: true,
    });
    if (!ok) return;
    deleteAppMinutes(date, id);
    setMessage(format(s.deleted, { app: appName(id, strings) }));
    if (id === app) {
      setHours('');
      setMinutes('');
    }
  };

  const errorText =
    error === null
      ? null
      : error === 'over-day'
        ? format(s.errors['over-day'], { max: formatDuration(maxMinutesFor(usage, app), strings) })
        : s.errors[error];

  if (demo) {
    return (
      <Screen>
        <ScreenHeader title={s.title} modal />
        <Notice>{s.demoNotice}</Notice>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button label={s.save} onPress={save} />}>
      <ScreenHeader title={s.title} modal />
      <Notice>{s.selfReported}</Notice>

      <SectionTitle>{s.day}</SectionTitle>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={s.day}>
        {dayOptions.map((option) => (
          <Chip
            key={option}
            label={formatDay(option, strings, language, today)}
            selected={option === date}
            onPress={() => {
              setDate(option);
              setMessage(null);
              loadApp(app, option);
            }}
          />
        ))}
      </View>

      <SectionTitle>{s.app}</SectionTitle>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={s.app}>
        {appChoices.map((id) => (
          <Chip key={id} label={appName(id, strings)} selected={id === app} onPress={() => loadApp(id)} />
        ))}
      </View>

      <View style={styles.fields}>
        <NumberField label={s.hours} value={hours} onChangeText={setHours} maxLength={2} invalid={error !== null} />
        <NumberField label={s.minutes} value={minutes} onChangeText={setMinutes} maxLength={2} invalid={error !== null} />
      </View>

      {errorText ? <Notice tone="warning">{errorText}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}
      {existing !== undefined && !message ? (
        <Notice>{format(s.existing, { time: formatDuration(existing, strings), app: appName(app, strings) })}</Notice>
      ) : null}
      {day?.source === 'auto' && dayTotal !== null ? <Notice>{s.autoDay}</Notice> : null}

      <SectionTitle>{format(s.entriesTitle, { day: formatDay(date, strings, language, today) })}</SectionTitle>
      <Card>
        {entries.length === 0 ? (
          <AppText variant="body" color={colors.textMuted}>
            {s.noEntries}
          </AppText>
        ) : (
          entries.map((id) => (
            <View key={id} style={styles.entry}>
              <View style={styles.flex}>
                <AppText variant="label">{appName(id, strings)}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {formatDuration(usage[id] ?? 0, strings)}
                </AppText>
              </View>
              <Pressable accessibilityRole="button" onPress={() => loadApp(id)} style={styles.action} hitSlop={4}>
                <AppText variant="label" color={colors.action}>
                  {strings.common.edit}
                </AppText>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => remove(id)} style={styles.action} hitSlop={4}>
                <AppText variant="label" color={colors.warning}>
                  {strings.common.delete}
                </AppText>
              </Pressable>
            </View>
          ))
        )}
        {dayTotal !== null ? (
          <AppText variant="label" style={styles.total}>
            {format(s.total, { time: formatDuration(dayTotal, strings) })}
          </AppText>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  fields: { flexDirection: 'row', gap: spacing.md },
  entry: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 48 },
  flex: { flex: 1 },
  action: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  total: { marginTop: spacing.sm },
});
