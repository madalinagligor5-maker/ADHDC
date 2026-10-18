import { router, useLocalSearchParams } from 'expo-router';

import {
  AppText,
  Button,
  Card,
  EmptyState,
  ScoreBadge,
  ScoreRing,
  Screen,
  ScreenHeader,
  SectionTitle,
  StatRow,
} from '@/components';
import { APPS, ONBOARDING_APPS } from '@/domain/apps';
import type { ScoreTier } from '@/domain/score';
import { dayScore } from '@/domain/stats';
import { emptyDay, type DayRecord } from '@/domain/types';
import { useToday } from '@/hooks/useToday';
import { format, formatDuration, useStrings } from '@/i18n';
import { colors, tierColor } from '@/theme';

const SCALE: { tier: ScoreTier; range: string }[] = [
  { tier: 'clean', range: '90–100' },
  { tier: 'good', range: '70–89' },
  { tier: 'moderate', range: '40–69' },
  { tier: 'high', range: '10–39' },
  { tier: 'npc', range: '0–9' },
];

function signed(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded > 0 ? `+${rounded}` : String(rounded);
}

/** Sample day for "Explorează un exemplu" in onboarding. Never saved. */
const EXAMPLE_DAY: DayRecord = {
  ...emptyDay('example'),
  usage: { tiktok: 20, instagram: 15, youtube: 7 },
  hasUsage: true,
};
const EXAMPLE_SETTINGS = { dailyLimitMin: 60, trackedApps: ONBOARDING_APPS };

/** Daily score detail: how the number was built. `?example=1` shows a sample day. */
export default function ScoreDetail() {
  const strings = useStrings();
  const s = strings.scoreDetail;
  const today = useToday();
  const isExample = useLocalSearchParams<{ example?: string }>().example === '1';
  const day = isExample ? EXAMPLE_DAY : today.day;
  const settings = isExample ? EXAMPLE_SETTINGS : today.settings;
  const score = isExample ? dayScore(EXAMPLE_DAY, EXAMPLE_SETTINGS) : today.score;

  return (
    <Screen
      footer={isExample ? <Button tone="cyan" label={s.exampleCta} onPress={() => router.back()} /> : undefined}
    >
      <ScreenHeader title={isExample ? s.exampleTitle : s.title} />
      {isExample ? (
        <AppText variant="body" color={colors.textMuted}>
          {s.exampleBody}
        </AppText>
      ) : null}

      {!score || !day ? (
        <EmptyState
          emoji="🧮"
          title={s.emptyTitle}
          body={s.emptyBody}
          actionLabel={strings.dashboard.addTime}
          onAction={() => router.push('/manual-entry')}
        />
      ) : (
        <>
          <ScoreRing score={score.score} label={strings.dashboard.scoreLabel} size={190} />
          <ScoreBadge tier={score.tier} />

          <SectionTitle>{s.breakdown}</SectionTitle>
          <Card>
            <StatRow label={s.start} value={String(score.start)} />
            {score.slices
              .filter((slice) => slice.minutes > 0)
              .map((slice) => (
                <StatRow
                  key={slice.fromMin}
                  label={format(Number.isFinite(slice.toMin) ? s.penaltyTier : s.penaltyTierOpen, {
                    from: slice.fromMin,
                    to: slice.toMin,
                    rate: slice.rate,
                  })}
                  value={signed(-slice.points)}
                  valueColor={colors.coral}
                />
              ))}
            {score.challengeBonus > 0 ? (
              <StatRow label={s.challengeBonus} value={signed(score.challengeBonus)} valueColor={colors.accent} />
            ) : null}
            {score.limitBonus > 0 ? (
              <StatRow label={s.limitBonus} value={signed(score.limitBonus)} valueColor={colors.accent} />
            ) : null}
            {score.focusBonus > 0 ? (
              <StatRow label={s.focusBonus} value={signed(score.focusBonus)} valueColor={colors.accent} />
            ) : null}
            <StatRow label={s.final} value={String(score.score)} valueColor={tierColor(score.tier)} />
            <AppText variant="caption" color={colors.textFaint}>
              {s.clamped}
            </AppText>
          </Card>

          <SectionTitle>{s.perApp}</SectionTitle>
          <Card>
            {settings.trackedApps.map((id) => (
              <StatRow
                key={id}
                label={APPS[id].name}
                value={formatDuration(day.usage[id] ?? 0, strings)}
                dotColor={APPS[id].color}
              />
            ))}
          </Card>
          {!isExample ? (
            <Button variant="ghost" label={strings.dashboard.editTime} onPress={() => router.push('/manual-entry')} />
          ) : null}
        </>
      )}

      <SectionTitle>{s.scale}</SectionTitle>
      <Card>
        {SCALE.map((entry) => (
          <StatRow
            key={entry.tier}
            label={strings.tiers[entry.tier]}
            value={entry.range}
            dotColor={tierColor(entry.tier)}
            valueColor={entry.tier === score?.tier ? tierColor(entry.tier) : colors.textMuted}
          />
        ))}
      </Card>
    </Screen>
  );
}
