import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, ChallengeCard, EmptyState, Screen, ScreenHeader, SectionTitle, StatRow } from '@/components';
import { extraChallenges, getChallenge } from '@/domain/challenges';
import { addDays, fromDateKey } from '@/domain/date';
import { currentPlan, PLANS } from '@/domain/plans';
import { useToday } from '@/hooks/useToday';
import { useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

export default function ChallengesScreen() {
  const strings = useStrings();
  const s = strings.challenges;
  const today = useToday();
  const days = useAppStore((state) => state.days);
  const setChallengeCompleted = useAppStore((state) => state.setChallengeCompleted);
  const plan = PLANS[currentPlan()];

  const locked = useMemo(
    () => extraChallenges(today.date, today.settings.trackedApps, PLANS.plus.dailyChallenges - plan.dailyChallenges),
    [today.date, today.settings.trackedApps, plan.dailyChallenges],
  );

  const history = useMemo(() => {
    const oldest = plan.historyDays === null ? null : addDays(today.date, -(plan.historyDays - 1));
    return Object.values(days)
      .filter((day) => day !== undefined && day.challengeCompleted && (oldest === null || day.date >= oldest))
      .sort((a, b) => b.date.localeCompare(a.date))
      .flatMap((day) => {
        const challenge = getChallenge(day.challengeId);
        return challenge ? [{ date: day.date, challenge }] : [];
      });
  }, [days, today.date, plan.historyDays]);

  return (
    <Screen>
      <ScreenHeader title={s.title} />

      <SectionTitle>{s.today}</SectionTitle>
      <ChallengeCard
        challenge={today.challenge}
        completed={today.challengeCompleted}
        onToggle={() => setChallengeCompleted(today.date, today.challenge.id, !today.challengeCompleted)}
      />

      {locked.length > 0 ? (
        <>
          <SectionTitle>{s.plusTitle}</SectionTitle>
          <AppText variant="caption" color={colors.textMuted}>
            {s.plusBody}
          </AppText>
          <View style={{ gap: spacing.sm }}>
            {locked.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} locked compact onPress={() => router.push('/paywall')} />
            ))}
          </View>
          <Button variant="ghost" label={strings.settings.plusHint} onPress={() => router.push('/paywall')} />
        </>
      ) : null}

      <SectionTitle>{s.historyTitle}</SectionTitle>
      {history.length === 0 ? (
        <EmptyState emoji="🏁" title={s.historyEmpty} />
      ) : (
        <Card>
          {history.map((entry) => (
            <StatRow
              key={entry.date}
              label={`${entry.challenge.emoji} ${s.items[entry.challenge.id].title}`}
              value={fromDateKey(entry.date).toLocaleDateString(today.settings.language, { day: 'numeric', month: 'short' })}
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}
