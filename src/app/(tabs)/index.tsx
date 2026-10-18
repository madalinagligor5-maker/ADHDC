import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  ChallengeCard,
  EmptyState,
  ErrorState,
  ScoreBadge,
  ScoreRing,
  Screen,
  SectionTitle,
  StatRow,
} from '@/components';
import { APPS } from '@/domain/apps';
import { useScreenTimeSync } from '@/hooks/useScreenTimeSync';
import { useToday } from '@/hooks/useToday';
import { format, formatDuration, useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';

export default function Dashboard() {
  const strings = useStrings();
  const s = strings.dashboard;
  const today = useToday();
  const { status, sync } = useScreenTimeSync();
  const setChallengeCompleted = useAppStore((state) => state.setChallengeCompleted);
  const { score, day, settings } = today;

  const streakLabel =
    today.streak === 0 ? s.streakZero : today.streak === 1 ? s.streakDay : format(s.streakDays, { n: today.streak });
  const limitProgress = Math.min(1, today.minutes / settings.dailyLimitMin);
  const overLimit = today.minutes > settings.dailyLimitMin;

  return (
    <Screen
      edges={['top']}
      footer={<Button label={s.focusCta} onPress={() => router.push('/focus')} />}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" color={colors.accent}>
            {strings.common.appName}
          </AppText>
          <AppText variant="heading">{s.greeting}</AppText>
        </View>
        <View style={styles.streakChip} accessible accessibilityLabel={`${s.streak}: ${streakLabel}`}>
          <AppText variant="label">🔥 {today.streak}</AppText>
        </View>
      </View>

      <Card onPress={() => router.push('/score')} style={styles.scoreCard} accessibilityLabel={s.seeDetails}>
        <ScoreRing score={score?.score ?? null} label={s.scoreLabel} />
        {score ? (
          <>
            <ScoreBadge tier={score.tier} />
            <AppText variant="body" align="center" color={colors.textMuted}>
              {strings.tierHints[score.tier]}
            </AppText>
            <AppText variant="caption" align="center" color={colors.textFaint}>
              {s.provisional}
            </AppText>
          </>
        ) : null}
      </Card>

      {status === 'syncing' ? (
        <AppText variant="caption" align="center" color={colors.textMuted}>
          {s.syncing}
        </AppText>
      ) : null}
      {status === 'error' ? <ErrorState body={s.syncError} onRetry={sync} /> : null}

      {!day?.hasUsage ? (
        <EmptyState
          emoji="🤔"
          title={s.noDataTitle}
          body={s.noDataBody}
          actionLabel={s.addTime}
          onAction={() => router.push('/manual-entry')}
        />
      ) : (
        <>
          <Card>
            <AppText variant="caption" color={colors.textMuted}>
              {s.totalToday}
            </AppText>
            <AppText variant="title" color={overLimit ? colors.coral : colors.text}>
              {formatDuration(today.minutes, strings)}
            </AppText>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${limitProgress * 100}%`, backgroundColor: overLimit ? colors.coral : colors.accent },
                ]}
              />
            </View>
            <View style={styles.rowBetween}>
              <AppText variant="caption" color={colors.textMuted}>
                {format(s.limitOf, { limit: formatDuration(settings.dailyLimitMin, strings) })}
              </AppText>
              <AppText variant="caption" color={colors.textFaint}>
                {day.source === 'auto' ? s.autoSource : s.manualSource}
              </AppText>
            </View>
            <Button variant="ghost" label={s.editTime} onPress={() => router.push('/manual-entry')} />
          </Card>

          <SectionTitle>{s.topApps}</SectionTitle>
          <Card>
            {today.top.length === 0 ? (
              <AppText variant="body" color={colors.textMuted}>
                {s.topAppsEmpty}
              </AppText>
            ) : (
              today.top.map((entry, index) => (
                <StatRow
                  key={entry.id}
                  label={`${index + 1}. ${APPS[entry.id].name}`}
                  value={formatDuration(entry.minutes, strings)}
                  dotColor={APPS[entry.id].color}
                />
              ))
            )}
          </Card>
        </>
      )}

      <SectionTitle>{s.challengeTitle}</SectionTitle>
      <ChallengeCard
        compact
        challenge={today.challenge}
        completed={today.challengeCompleted}
        onPress={() => router.push('/challenges')}
        onToggle={() => setChallengeCompleted(today.date, today.challenge.id, !today.challengeCompleted)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  streakChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  scoreCard: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.md },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
});
