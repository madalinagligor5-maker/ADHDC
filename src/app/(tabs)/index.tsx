import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LogoMark,
  ScoreBadge,
  ScoreRing,
  Screen,
  SectionTitle,
  StatRow,
  StatTile,
} from '@/components';
import { APPS } from '@/domain/apps';
import { SCORE_RULES } from '@/domain/score';
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
  const overLimit = today.minutes > settings.dailyLimitMin;
  const challengeText = strings.challenges.items[today.challenge.id];
  const toggleChallenge = () => setChallengeCompleted(today.date, today.challenge.id, !today.challengeCompleted);

  return (
    <Screen edges={['top']} footer={<Button label={s.focusCta} onPress={() => router.navigate('/pause')} />}>
      <View style={styles.center}>
        <LogoMark size={40} />
      </View>
      <AppText variant="title" align="center" accessibilityRole="header">
        {s.greeting}
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={s.seeDetails}
        onPress={() => router.push('/score')}
        style={({ pressed }) => [styles.scoreBlock, pressed && styles.pressed]}
      >
        <ScoreRing score={score?.score ?? null} label={s.scoreLabel} size={200} />
        <AppText variant="body" align="center" color={colors.textMuted}>
          {s.scoreHint}
        </AppText>
        {score ? <ScoreBadge tier={score.tier} /> : null}
      </Pressable>

      {status === 'syncing' ? (
        <AppText variant="caption" align="center" color={colors.textMuted}>
          {s.syncing}
        </AppText>
      ) : null}
      {status === 'error' ? <ErrorState body={s.syncError} onRetry={sync} /> : null}

      {!day?.hasUsage ? (
        <EmptyState
          emoji="⏱️"
          title={s.noDataTitle}
          body={s.noDataBody}
          actionLabel={s.addTime}
          onAction={() => router.push('/manual-entry')}
        />
      ) : null}

      <View style={styles.tiles}>
        <StatTile
          label={s.totalToday}
          value={day?.hasUsage ? formatDuration(today.minutes, strings) : '—'}
          valueColor={overLimit ? colors.coral : colors.text}
        />
        <StatTile label={s.streak} value={streakLabel} />
      </View>

      <Card onPress={() => router.push('/challenges')} accessibilityLabel={s.challengeTitle}>
        <View style={styles.challengeRow}>
          <View style={styles.flex}>
            <AppText variant="caption" color={colors.textMuted}>
              {s.challengeTitle}
            </AppText>
            <AppText variant="heading">{challengeText.title}</AppText>
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: today.challengeCompleted }}
            accessibilityLabel={strings.challenges.complete}
            hitSlop={8}
            onPress={toggleChallenge}
            style={[styles.check, today.challengeCompleted && styles.checkOn]}
          >
            {today.challengeCompleted ? (
              <AppText variant="label" color={colors.onAccent}>
                ✓
              </AppText>
            ) : null}
          </Pressable>
        </View>
        <AppText variant="caption" color={today.challengeCompleted ? colors.accent : colors.textMuted}>
          {today.challengeCompleted
            ? `✓ ${strings.challenges.completed}`
            : format(strings.challenges.bonus, { n: SCORE_RULES.challengeBonus })}
        </AppText>
      </Card>

      {day?.hasUsage ? (
        <>
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
          <AppText variant="caption" align="center" color={colors.textFaint}>
            {s.provisional}
          </AppText>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  scoreBlock: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  pressed: { opacity: 0.85 },
  tiles: { flexDirection: 'row', gap: spacing.sm },
  challengeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: 4 },
  check: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, marginTop: spacing.xs },
});
