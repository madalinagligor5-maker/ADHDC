import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, LogoMark, ProgressRing, Screen, ScreenHeader, Segmented } from '@/components';
import { SCORE_RULES } from '@/domain/score';
import type { FocusDuration } from '@/domain/types';
import { format, useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, spacing } from '@/theme';
import { confirm } from '@/utils/confirm';

const DURATIONS: FocusDuration[] = [15, 30, 45, 60];

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default function FocusScreen() {
  const strings = useStrings();
  const s = strings.focus;
  const active = useAppStore((state) => state.activeFocus);
  const startFocus = useAppStore((state) => state.startFocus);
  const finishFocus = useAppStore((state) => state.finishFocus);
  const [duration, setDuration] = useState<FocusDuration>(30);
  const [earned, setEarned] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now);

  // The timer is timestamp-based, so it stays correct if the app was in the background.
  useEffect(() => {
    if (!active) return;
    const endsAt = active.startedAt + active.durationMin * 60_000;
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) {
        finishFocus(true);
        setEarned(SCORE_RULES.focusBonus[active.durationMin]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [active, finishFocus]);

  const totalMs = active ? active.durationMin * 60_000 : 0;
  const remainingMs = active ? Math.min(totalMs, Math.max(0, active.startedAt + totalMs - now)) : 0;

  const giveUp = async () => {
    const stop = await confirm({
      title: s.confirmStopTitle,
      message: s.confirmStopBody,
      confirmLabel: s.stop,
      cancelLabel: s.keepGoing,
      destructive: true,
    });
    if (!stop) return;
    finishFocus(false);
  };

  if (earned !== null) {
    return (
      <Screen edges={['top']} contentStyle={styles.center} footer={
          <Button
            label={s.doneCta}
            onPress={() => {
              setEarned(null);
              router.navigate('/');
            }}
          />
        }>
        <View style={styles.ring}>
          <LogoMark size={120} />
        </View>
        <AppText variant="title" align="center">
          {s.doneTitle}
        </AppText>
        <AppText variant="body" align="center" color={colors.textMuted}>
          {format(s.doneBody, { n: earned })}
        </AppText>
      </Screen>
    );
  }

  if (active) {
    const elapsed = 1 - remainingMs / totalMs;
    const message = s.messages[Math.floor((totalMs - remainingMs) / 120_000) % s.messages.length];
    return (
      <Screen edges={['top']} contentStyle={styles.center} footer={<Button variant="ghost" label={s.stop} onPress={giveUp} />}>
        <AppText variant="title" align="center">
          {s.title}
        </AppText>
        <View style={styles.ring}>
          <ProgressRing progress={elapsed} size={260} strokeWidth={16} glow>
            <AppText style={styles.clock} accessibilityRole="timer">
              {formatClock(remainingMs)}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {s.remaining}
            </AppText>
          </ProgressRing>
        </View>
        <AppText variant="heading" align="center">
          {message}
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']} footer={<Button label={s.start} onPress={() => startFocus(duration)} />}>
      <ScreenHeader title={s.title} showBack={false} />
      <AppText variant="body" color={colors.textMuted}>
        {s.chooseDuration}
      </AppText>
      <View style={styles.ring}>
        <ProgressRing progress={duration / 60} size={220}>
          <AppText style={styles.clock}>{duration}</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {strings.common.minutesShort} · {format(s.bonusHint, { n: SCORE_RULES.focusBonus[duration] })}
          </AppText>
        </ProgressRing>
      </View>
      <Segmented
        value={duration}
        onChange={setDuration}
        options={DURATIONS.map((value) => ({ value, label: `${value}` }))}
      />
      <AppText variant="caption" align="center" color={colors.textFaint}>
        {s.note}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flexGrow: 1, justifyContent: 'center', gap: spacing.lg },
  ring: { alignItems: 'center', marginVertical: spacing.md },
  clock: { fontFamily: fonts.heading, fontSize: 56, lineHeight: 64, color: colors.text },
});
