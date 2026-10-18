import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  DemoBanner,
  ErrorState,
  LogoMark,
  Notice,
  ScoreRing,
  Screen,
  StatTile,
} from '@/components';
import { minutesOverLimit } from '@/domain/score';
import { useScreenTimeSync } from '@/hooks/useScreenTimeSync';
import { useToday } from '@/hooks/useToday';
import { format, formatDays, formatDuration, useLanguage, useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

export default function Dashboard() {
  const strings = useStrings();
  const language = useLanguage();
  const s = strings.dashboard;
  const today = useToday();
  const { status, sync } = useScreenTimeSync();
  const purpose = useAppStore((state) => state.settings.purpose);
  const scoreTipSeen = useAppStore((state) => state.scoreTipSeen);
  const dismissScoreTip = useAppStore((state) => state.dismissScoreTip);
  const setChallengeDone = useAppStore((state) => state.setChallengeDone);

  const { day, score, minutes, limitMin, challenge, isDemo } = today;
  const hasData = minutes !== null;
  const over = hasData ? minutesOverLimit(minutes, limitMin) : 0;
  const source = isDemo ? s.sources.demo : day?.source === 'auto' ? s.sources.auto : s.sources.manual;
  const challengeText = strings.challenges.items[challenge.id];
  const done = Boolean(day?.challengeDone && day.challengeId === challenge.id);
  const selfReported = challenge.verification.kind === 'self';

  return (
    <Screen
      edges={['top']}
      footer={
        <>
          <Button label={s.startPause} onPress={() => router.navigate('/pause')} />
          {!isDemo ? (
            <Button variant="ghost" label={hasData ? s.editTime : s.addTime} onPress={() => router.push('/manual-entry')} />
          ) : null}
        </>
      }
    >
      <DemoBanner detailed />
      <View style={styles.center}>
        <LogoMark size={36} />
      </View>
      <AppText variant="title" align="center" accessibilityRole="header">
        {s.title}
      </AppText>
      {purpose && !isDemo ? (
        <AppText variant="caption" align="center" color={colors.textMuted}>
          {strings.purposeLines[purpose]}
        </AppText>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityHint={s.seeDetails}
        onPress={() => router.push('/score')}
        style={({ pressed }) => [styles.scoreBlock, pressed && styles.pressed]}
      >
        <ScoreRing score={score} label={s.scoreLabel} size={196} />
        {hasData ? (
          <>
            <AppText variant="body" align="center" color={colors.textMuted}>
              {s.scoreHint}
            </AppText>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: over > 0 ? colors.warning : colors.progress }]} />
              <AppText variant="label" color={over > 0 ? colors.warning : colors.progress}>
                {over > 0 ? format(s.overLimit, { n: over }) : s.withinLimit}
              </AppText>
            </View>
          </>
        ) : (
          <View style={styles.emptyText}>
            <AppText variant="heading" align="center">
              {s.emptyTitle}
            </AppText>
            <AppText variant="body" align="center" color={colors.textMuted}>
              {s.emptyBody}
            </AppText>
          </View>
        )}
      </Pressable>

      {hasData && !scoreTipSeen && !isDemo ? (
        <Notice action={<Button variant="ghost" label={s.tipDismiss} onPress={dismissScoreTip} />}>{s.tip}</Notice>
      ) : null}

      {status === 'syncing' ? (
        <AppText variant="caption" align="center" color={colors.textMuted} accessibilityLiveRegion="polite">
          {s.syncing}
        </AppText>
      ) : null}
      {status === 'error' ? <ErrorState body={s.syncError} onRetry={sync} /> : null}
      {status === 'skipped-manual' ? <Notice>{s.skippedManual}</Notice> : null}

      <View style={styles.tiles}>
        <StatTile
          label={s.timeInApps}
          value={hasData ? formatDuration(minutes, strings) : '—'}
          footnote={hasData ? source : strings.common.noData}
        />
        <StatTile label={s.dailyGoal} value={formatDuration(limitMin, strings)} />
      </View>
      <StatTile label={s.streak} value={formatDays(today.streak, strings, language)} />

      <Card onPress={() => router.push('/challenges')} accessibilityLabel={`${s.challengeTitle}: ${challengeText.title}`}>
        <View style={styles.challengeRow}>
          <Ionicons name={challenge.icon} size={24} color={done ? colors.progress : colors.textMuted} />
          <View style={styles.flex}>
            <AppText variant="caption" color={colors.textMuted}>
              {s.challengeTitle}
            </AppText>
            <AppText variant="heading">{challengeText.title}</AppText>
          </View>
          {selfReported && !isDemo ? (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              accessibilityLabel={strings.challenges.markDone}
              hitSlop={8}
              onPress={() => setChallengeDone(today.date, challenge.id, !done)}
              style={[styles.check, done && styles.checkOn]}
            >
              {done ? <Ionicons name="checkmark" size={18} color={colors.onAction} /> : null}
            </Pressable>
          ) : null}
        </View>
        {done ? (
          <AppText variant="caption" color={colors.progress}>
            {day?.challengeVerified ? strings.challenges.doneVerified : strings.challenges.doneSelf}
          </AppText>
        ) : !selfReported && challenge.verification.kind === 'pause' ? (
          <AppText variant="caption" color={colors.textMuted}>
            {format(strings.challenges.pauseHint, { n: challenge.verification.minMinutes })}
          </AppText>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  scoreBlock: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  pressed: { opacity: 0.85 },
  emptyText: { gap: spacing.xs, maxWidth: 320 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  challengeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: 2 },
  check: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.progress, borderColor: colors.progress },
});
