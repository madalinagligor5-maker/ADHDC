import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Chip,
  DemoBanner,
  LogoMark,
  Notice,
  ProgressRing,
  Screen,
  ScreenHeader,
} from '@/components';
import { getChallenge } from '@/domain/challenges';
import { todayKey } from '@/domain/date';
import {
  elapsedMs,
  isFinished,
  PAUSE_DURATIONS,
  plannedMs,
  remainingMs,
  type PauseDuration,
  type PauseSession,
} from '@/domain/pause';
import { format, formatDuration, useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, spacing } from '@/theme';
import { confirm } from '@/utils/confirm';

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default function PauseScreen() {
  const strings = useStrings();
  const s = strings.pause;
  const demo = useAppStore((state) => state.demo);
  const active = useAppStore((state) => state.activePause);
  const start = useAppStore((state) => state.startPause);
  const hold = useAppStore((state) => state.holdPause);
  const resume = useAppStore((state) => state.resumePause);
  const end = useAppStore((state) => state.endPause);
  const [duration, setDuration] = useState<PauseDuration>(20);
  const [result, setResult] = useState<{ session: PauseSession; confirmedChallenge: string | null } | null>(null);
  const [now, setNow] = useState(Date.now);

  const finish = () => {
    const before = useAppStore.getState();
    const date = before.activePause ? todayKey(new Date(before.activePause.startedAt)) : todayKey();
    const wasVerified = Boolean(before.days[date]?.challengeVerified);
    const session = end();
    if (!session) return;
    const after = useAppStore.getState().days[date];
    const challenge = !wasVerified && after?.challengeVerified ? getChallenge(after.challengeId) : undefined;
    setResult({ session, confirmedChallenge: challenge ? strings.challenges.items[challenge.id].title : null });
    if (session.completed && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
  };

  // Ticks only refresh the display; all time math uses timestamps, so it stays
  // correct after the app was backgrounded or closed and reopened.
  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (isFinished(active, current)) finish();
    };
    const timer = setInterval(tick, 1000);
    const first = setTimeout(tick, 0);
    return () => {
      clearInterval(timer);
      clearTimeout(first);
    };
    // `finish` reads fresh state from the store; re-running on its identity is unnecessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const endEarly = async () => {
    const ok = await confirm({
      title: s.confirmEndTitle,
      message: s.confirmEndBody,
      confirmLabel: s.end,
      cancelLabel: strings.common.cancel,
    });
    if (ok) finish();
  };

  if (result) {
    const { session } = result;
    return (
      <Screen
        edges={['top']}
        contentStyle={styles.center}
        footer={
          <Button
            label={s.home}
            onPress={() => {
              setResult(null);
              router.navigate('/');
            }}
          />
        }
      >
        <View style={styles.ring}>
          <LogoMark size={96} />
        </View>
        <AppText variant="title" align="center" accessibilityRole="header">
          {session.completed ? s.doneTitle : s.endedEarlyTitle}
        </AppText>
        <AppText variant="body" align="center" color={colors.textMuted}>
          {session.completed
            ? s.doneBody
            : format(s.endedEarlyBody, { time: formatDuration(Math.floor(session.elapsedMs / 60_000), strings) })}
        </AppText>
        {result.confirmedChallenge ? (
          <Notice tone="success">{format(s.challengeConfirmed, { title: result.confirmedChallenge })}</Notice>
        ) : null}
        {demo ? <Notice>{s.demoNote}</Notice> : null}
      </Screen>
    );
  }

  if (active) {
    const paused = active.runningSince === null;
    const progress = elapsedMs(active, now) / plannedMs(active);
    const remaining = remainingMs(active, now);
    return (
      <Screen
        edges={['top']}
        contentStyle={styles.center}
        footer={
          <View style={styles.actions}>
            <View style={styles.flex}>
              <Button
                variant="secondary"
                label={paused ? s.resume : s.hold}
                onPress={() => (paused ? resume() : hold())}
              />
            </View>
            <View style={styles.flex}>
              <Button variant="secondary" label={s.end} onPress={endEarly} />
            </View>
          </View>
        }
      >
        <DemoBanner />
        <View style={styles.ring}>
          <ProgressRing progress={progress} size={252} strokeWidth={10} color={colors.progress}>
            <AppText
              style={styles.clock}
              accessibilityRole="timer"
              accessibilityLabel={`${formatClock(remaining)} ${s.remaining}`}
            >
              {formatClock(remaining)}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {paused ? s.paused : s.remaining}
            </AppText>
          </ProgressRing>
        </View>
        <AppText variant="heading" align="center">
          {s.message}
        </AppText>
        <AppText variant="caption" align="center" color={colors.textMuted}>
          {s.noBlocking}
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']} footer={<Button label={s.start} onPress={() => start(duration)} />}>
      <DemoBanner />
      <ScreenHeader title={s.title} showBack={false} />
      <AppText variant="body" color={colors.textMuted}>
        {s.chooseDuration}
      </AppText>
      <View style={styles.ring}>
        <ProgressRing progress={duration / 60} size={200} strokeWidth={10} color={colors.progress}>
          <AppText style={styles.clock} allowFontScaling={false}>
            {duration}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {strings.common.minutesShort}
          </AppText>
        </ProgressRing>
      </View>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={s.chooseDuration}>
        {PAUSE_DURATIONS.map((value) => (
          <Chip
            key={value}
            label={`${value} ${strings.common.minutesShort}`}
            selected={value === duration}
            onPress={() => setDuration(value)}
          />
        ))}
      </View>
      <AppText variant="caption" align="center" color={colors.textMuted}>
        {s.noBlocking}
      </AppText>
      {demo ? <Notice>{s.demoNote}</Notice> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flexGrow: 1, justifyContent: 'center', gap: spacing.md },
  ring: { alignItems: 'center', marginVertical: spacing.md },
  clock: { fontFamily: fonts.heading, fontSize: 56, lineHeight: 64, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
