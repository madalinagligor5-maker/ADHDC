import { router } from 'expo-router';

import { AppText, Card, DemoBanner, EmptyState, ScoreRing, Screen, ScreenHeader, SectionTitle, StatRow } from '@/components';
import { APPS, topApps } from '@/domain/apps';
import { computeScore } from '@/domain/score';
import { useToday } from '@/hooks/useToday';
import { appName, format, formatDuration, useStrings } from '@/i18n';
import { colors } from '@/theme';

const EXAMPLES = [
  { usage: 30, limit: 60 },
  { usage: 60, limit: 60 },
  { usage: 120, limit: 60 },
];

/** How today's Fade Score is calculated, with the formula and worked examples. */
export default function ScoreDetail() {
  const strings = useStrings();
  const s = strings.scoreDetail;
  const { day, minutes, score, limitMin, isDemo } = useToday();

  return (
    <Screen>
      <ScreenHeader title={s.title} />
      <DemoBanner />

      {score === null || minutes === null || !day ? (
        <EmptyState
          title={s.emptyTitle}
          body={s.emptyBody}
          actionLabel={isDemo ? undefined : strings.dashboard.addTime}
          onAction={isDemo ? undefined : () => router.push('/manual-entry')}
        />
      ) : (
        <>
          <ScoreRing score={score} label={strings.dashboard.scoreLabel} size={180} />
          <SectionTitle>{s.yourDay}</SectionTitle>
          <Card>
            <StatRow label={s.usage} value={formatDuration(minutes, strings)} />
            <StatRow label={s.limit} value={formatDuration(limitMin, strings)} />
            <StatRow label={s.result} value={`${score}/100`} valueColor={colors.progress} />
          </Card>
          {topApps(day.usage, 5).length > 0 ? (
            <>
              <SectionTitle>{s.perApp}</SectionTitle>
              <Card>
                {topApps(day.usage, 5).map((entry) => (
                  <StatRow
                    key={entry.id}
                    label={appName(entry.id, strings)}
                    value={formatDuration(entry.minutes, strings)}
                    dotColor={APPS[entry.id].color}
                  />
                ))}
              </Card>
            </>
          ) : null}
        </>
      )}

      <SectionTitle>{s.formulaTitle}</SectionTitle>
      <Card>
        <AppText variant="body">{s.formula}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {strings.dashboard.tip}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {s.formulaNote}
        </AppText>
      </Card>

      <SectionTitle>{s.examples}</SectionTitle>
      <Card>
        {EXAMPLES.map((example) => (
          <AppText key={example.usage} variant="body">
            {format(s.exampleRow, {
              usage: example.usage,
              limit: example.limit,
              score: computeScore(example.usage, example.limit) ?? '—',
            })}
          </AppText>
        ))}
        <AppText variant="body" color={colors.textMuted}>
          {s.noDataRow}
        </AppText>
      </Card>
    </Screen>
  );
}
