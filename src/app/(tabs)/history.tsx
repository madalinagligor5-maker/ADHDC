import { router } from 'expo-router';
import { useMemo } from 'react';

import {
  AppText,
  Button,
  Card,
  EmptyState,
  Screen,
  ScreenHeader,
  SectionTitle,
  StatRow,
  WeekChart,
  type WeekChartPoint,
} from '@/components';
import { APPS } from '@/domain/apps';
import { getChallenge } from '@/domain/challenges';
import { fromDateKey, lastNDays } from '@/domain/date';
import { currentPlan, PLANS } from '@/domain/plans';
import { scoreTier } from '@/domain/score';
import { bestAndWorst, dayMinutes, dayScore, sumUsage, type ScoredDay } from '@/domain/stats';
import { useTodayKey } from '@/hooks/useToday';
import { formatDuration, useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, tierColor } from '@/theme';

export default function HistoryScreen() {
  const strings = useStrings();
  const s = strings.history;
  const today = useTodayKey();
  const days = useAppStore((state) => state.days);
  const settings = useAppStore((state) => state.settings);
  const plan = PLANS[currentPlan()];

  const data = useMemo(() => {
    const keys = lastNDays(Math.min(7, plan.historyDays ?? 7), today);
    const records = keys.map((key) => days[key]);
    const points: WeekChartPoint[] = keys.map((key) => ({
      key,
      label: strings.weekdaysShort[fromDateKey(key).getDay()],
      score: dayScore(days[key], settings)?.score ?? null,
      highlight: key === today,
    }));
    const scored: ScoredDay[] = keys.flatMap((key) => {
      const score = dayScore(days[key], settings);
      return score ? [{ date: key, score: score.score, minutes: dayMinutes(days[key], settings.trackedApps) }] : [];
    });
    const totals = sumUsage(records, settings.trackedApps);
    const perApp = settings.trackedApps
      .map((id) => ({ id, minutes: totals[id] ?? 0 }))
      .sort((a, b) => b.minutes - a.minutes);
    const challenges = records.flatMap((day) => {
      const challenge = day?.challengeCompleted ? getChallenge(day.challengeId) : undefined;
      return day && challenge ? [{ date: day.date, challenge }] : [];
    });
    return { points, scored, perApp, challenges, ...bestAndWorst(scored) };
  }, [days, settings, today, plan.historyDays, strings.weekdaysShort]);

  const formatDay = (key: string) =>
    fromDateKey(key).toLocaleDateString(settings.language, { weekday: 'long', day: 'numeric', month: 'short' });

  const hasAnything = data.scored.length > 0 || data.challenges.length > 0;

  return (
    <Screen edges={['top']}>
      <ScreenHeader title={s.title} showBack={false} />

      {!hasAnything ? (
        <EmptyState emoji="📈" title={s.emptyTitle} body={s.emptyBody} />
      ) : (
        <>
          <SectionTitle>{s.last7}</SectionTitle>
          <Card>
            <WeekChart points={data.points} emptyLabel={s.noData} />
          </Card>

          {data.best || data.worst ? (
            <Card>
              {data.best ? (
                <StatRow
                  label={`🏆 ${s.best} · ${formatDay(data.best.date)}`}
                  value={String(data.best.score)}
                  valueColor={tierColor(scoreTier(data.best.score))}
                />
              ) : null}
              {data.worst ? (
                <StatRow
                  label={`🫠 ${s.worst} · ${formatDay(data.worst.date)}`}
                  value={String(data.worst.score)}
                  valueColor={tierColor(scoreTier(data.worst.score))}
                />
              ) : null}
            </Card>
          ) : null}

          <SectionTitle>{s.perApp}</SectionTitle>
          <Card>
            {data.perApp.map((entry) => (
              <StatRow
                key={entry.id}
                label={APPS[entry.id].name}
                value={formatDuration(entry.minutes, strings)}
                dotColor={APPS[entry.id].color}
              />
            ))}
          </Card>

          <SectionTitle>{s.challenges}</SectionTitle>
          <Card>
            {data.challenges.length === 0 ? (
              <AppText variant="body" color={colors.textMuted}>
                {strings.challenges.historyEmpty}
              </AppText>
            ) : (
              data.challenges.map((entry) => (
                <StatRow
                  key={entry.date}
                  label={`${entry.challenge.emoji} ${strings.challenges.items[entry.challenge.id].title}`}
                  value={strings.weekdaysShort[fromDateKey(entry.date).getDay()]}
                />
              ))
            )}
          </Card>
        </>
      )}

      {plan.historyDays !== null ? (
        <Button variant="ghost" label={s.unlock} onPress={() => router.push('/paywall')} />
      ) : null}
    </Screen>
  );
}
