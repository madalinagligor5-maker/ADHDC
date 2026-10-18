import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  BarChart,
  Button,
  Card,
  DemoBanner,
  EmptyState,
  Screen,
  ScreenHeader,
  SectionTitle,
  Segmented,
  StatRow,
  StatTile,
  type BarPoint,
} from '@/components';
import { addDays, fromDateKey, lastNDays } from '@/domain/date';
import { canUse, HISTORY_DAYS } from '@/domain/plans';
import { buildSeries, compareAverages, MIN_DAYS_FOR_COMPARISON, summarize } from '@/domain/stats';
import { usePlan } from '@/hooks/usePlan';
import { useDataView, useTodayKey } from '@/hooks/useToday';
import { format, formatDay, formatDuration, formatWeekday, useLanguage, useStrings } from '@/i18n';
import { colors, spacing } from '@/theme';

type Range = 7 | 30 | 90;

export default function ProgressScreen() {
  const strings = useStrings();
  const language = useLanguage();
  const s = strings.progress;
  const today = useTodayKey();
  const view = useDataView();
  const plan = usePlan();
  const [range, setRange] = useState<Range>(7);
  const effectiveRange: Range = Math.min(range, HISTORY_DAYS[plan]) as Range;

  const data = useMemo(() => {
    const keys = lastNDays(effectiveRange, today);
    const series = buildSeries(view.days, keys);
    const summary = summarize(series);
    const startMs = fromDateKey(keys[0]).getTime();
    const pausesDone = view.pauses.filter((p) => p.completed && p.startedAt >= startMs).length;
    const challengesDone = keys.filter((key) => view.days[key]?.challengeDone).length;
    const last7 = summarize(buildSeries(view.days, lastNDays(7, today)));
    const previous7 = summarize(buildSeries(view.days, lastNDays(7, addDays(today, -7))));
    return {
      series,
      summary,
      pausesDone,
      challengesDone,
      last7,
      previous7,
      weeklyDiff: compareAverages(last7, previous7),
    };
  }, [view, today, effectiveRange]);

  const label = (date: string) => (effectiveRange === 7 ? formatWeekday(date, language) : date.slice(8));
  const spoken = (date: string, value: string) => `${formatDay(date, strings, language, today)}: ${value}`;

  const usagePoints: BarPoint[] = data.series.map((point) => ({
    key: point.date,
    label: label(point.date),
    value: point.minutes,
    reference: point.limitMin,
    highlight: point.date === today,
    accessibilityLabel: spoken(point.date, point.minutes === null ? strings.common.noData : formatDuration(point.minutes, strings)),
  }));
  const scorePoints: BarPoint[] = data.series.map((point) => ({
    key: point.date,
    label: label(point.date),
    value: point.score,
    highlight: point.date === today,
    accessibilityLabel: spoken(point.date, point.score === null ? strings.common.noData : `${point.score}/100`),
  }));

  const hasAnything = data.summary.daysWithData > 0 || data.pausesDone > 0 || data.challengesDone > 0;

  return (
    <Screen edges={['top']}>
      <DemoBanner />
      <ScreenHeader title={s.title} showBack={false} />

      {plan === 'plus' ? (
        <Segmented
          value={range}
          onChange={setRange}
          options={([7, 30, 90] as Range[]).map((value) => ({ value, label: format(s.range, { n: value }) }))}
        />
      ) : (
        <AppText variant="caption" color={colors.textMuted}>
          {format(s.range, { n: HISTORY_DAYS.free })}
        </AppText>
      )}

      {!hasAnything ? (
        <EmptyState title={s.emptyTitle} body={s.emptyBody} />
      ) : (
        <>
          <SectionTitle>{s.usageChart}</SectionTitle>
          <Card>
            <BarChart
              points={usagePoints}
              color={colors.textMuted}
              overColor={colors.warning}
              formatValue={(value) => `${Math.round(value)}`}
            />
            <AppText variant="caption" color={colors.textFaint}>
              {`${s.legendLimit} · ${s.legendNoData}`}
            </AppText>
          </Card>

          <SectionTitle>{s.scoreChart}</SectionTitle>
          <Card>
            <BarChart points={scorePoints} color={colors.progress} max={100} formatValue={(value) => `${value}`} height={100} />
          </Card>

          <View style={styles.tiles}>
            <StatTile
              label={s.goalDays}
              value={`${data.summary.daysMetGoal}`}
              footnote={format(s.goalDaysValue, { met: data.summary.daysMetGoal, total: data.summary.daysWithData })}
            />
            <StatTile label={s.pausesDone} value={`${data.pausesDone}`} />
            <StatTile label={s.challengesDone} value={`${data.challengesDone}`} footnote={strings.common.selfReported} />
          </View>
        </>
      )}

      <SectionTitle>{s.weeklyTitle}</SectionTitle>
      {canUse(plan, 'weeklyReport') ? (
        <Card>
          {data.weeklyDiff === null ? (
            <AppText variant="body" color={colors.textMuted}>
              {format(s.weeklyNotEnough, { n: MIN_DAYS_FOR_COMPARISON })}
            </AppText>
          ) : (
            <>
              <AppText variant="heading" color={data.weeklyDiff > 0 ? colors.progress : colors.text}>
                {data.weeklyDiff > 0
                  ? format(s.weeklyReduced, { n: data.weeklyDiff })
                  : data.weeklyDiff < 0
                    ? format(s.weeklyIncreased, { n: -data.weeklyDiff })
                    : s.weeklySame}
              </AppText>
              <StatRow label={s.avgThis} value={formatDuration(data.last7.averageMinutes ?? 0, strings)} />
              <StatRow label={s.avgPrev} value={formatDuration(data.previous7.averageMinutes ?? 0, strings)} />
            </>
          )}
        </Card>
      ) : (
        <Card onPress={() => router.push('/paywall')} accessibilityHint={strings.settings.seeOffer}>
          <AppText variant="body" color={colors.textMuted}>
            {s.weeklyLocked}
          </AppText>
        </Card>
      )}

      {plan === 'free' ? <Button variant="ghost" label={s.unlock} onPress={() => router.push('/paywall')} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
