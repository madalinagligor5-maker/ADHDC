import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, DemoBanner, Screen, ScreenHeader, SectionTitle, StatRow } from '@/components';
import { CHALLENGES, getChallenge, type Challenge } from '@/domain/challenges';
import { lastNDays } from '@/domain/date';
import { canUse } from '@/domain/plans';
import { usePlan } from '@/hooks/usePlan';
import { useToday } from '@/hooks/useToday';
import { format, formatDay, useLanguage, useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

export default function ChallengesScreen() {
  const strings = useStrings();
  const language = useLanguage();
  const s = strings.challenges;
  const today = useToday();
  const plan = usePlan();
  const setChallenge = useAppStore((state) => state.setChallenge);
  const setChallengeDone = useAppStore((state) => state.setChallengeDone);
  const { challenge, day, isDemo, date } = today;
  const done = Boolean(day?.challengeDone && day.challengeId === challenge.id);
  const libraryOpen = canUse(plan, 'challengeLibrary') && !isDemo;

  const history = useMemo(
    () =>
      lastNDays(7, date)
        .reverse()
        .flatMap((key) => {
          const record = today.days[key];
          const item = record?.challengeDone ? getChallenge(record.challengeId) : undefined;
          return record && item ? [{ date: key, challenge: item, verified: record.challengeVerified }] : [];
        }),
    [today.days, date],
  );

  const status = (item: Challenge) =>
    item.verification.kind === 'pause' ? format(s.pauseHint, { n: item.verification.minMinutes }) : strings.common.selfReported;

  return (
    <Screen>
      <ScreenHeader title={s.title} />
      <DemoBanner />

      <SectionTitle>{s.today}</SectionTitle>
      <Card style={done ? styles.done : undefined}>
        <View style={styles.row}>
          <Ionicons name={challenge.icon} size={28} color={done ? colors.progress : colors.text} />
          <View style={styles.flex}>
            <AppText variant="heading">{s.items[challenge.id].title}</AppText>
            <AppText variant="body" color={colors.textMuted}>
              {s.items[challenge.id].description}
            </AppText>
          </View>
        </View>
        {done ? (
          <AppText variant="label" color={colors.progress}>
            {`✓ ${s.reward} · ${day?.challengeVerified ? s.doneVerified : s.doneSelf}`}
          </AppText>
        ) : (
          <AppText variant="caption" color={colors.textMuted}>
            {status(challenge)}
          </AppText>
        )}
        {challenge.verification.kind === 'self' && !isDemo ? (
          <Button
            variant={done ? 'ghost' : 'secondary'}
            label={done ? s.undo : s.markDone}
            onPress={() => setChallengeDone(date, challenge.id, !done)}
          />
        ) : null}
        {challenge.verification.kind === 'pause' && !done && !isDemo ? (
          <Button variant="secondary" label={strings.pause.start} onPress={() => router.navigate('/pause')} />
        ) : null}
      </Card>

      <SectionTitle>{s.libraryTitle}</SectionTitle>
      {!libraryOpen ? (
        <AppText variant="caption" color={colors.textMuted}>
          {s.libraryLocked}
        </AppText>
      ) : null}
      <View style={styles.list}>
        {CHALLENGES.filter((item) => item.id !== challenge.id).map((item) => (
          <Card key={item.id} style={!libraryOpen ? styles.locked : undefined}>
            <View style={styles.row}>
              <Ionicons name={libraryOpen ? item.icon : 'lock-closed-outline'} size={22} color={colors.textMuted} />
              <View style={styles.flex}>
                <AppText variant="label">{s.items[item.id].title}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {status(item)}
                </AppText>
              </View>
            </View>
            {libraryOpen ? (
              <Button variant="ghost" label={s.choose} onPress={() => setChallenge(date, item.id)} />
            ) : null}
          </Card>
        ))}
      </View>
      {!libraryOpen && !isDemo ? (
        <Button variant="ghost" label={strings.settings.seeOffer} onPress={() => router.push('/paywall')} />
      ) : null}

      <SectionTitle>{s.historyTitle}</SectionTitle>
      <Card>
        {history.length === 0 ? (
          <AppText variant="body" color={colors.textMuted}>
            {s.historyEmpty}
          </AppText>
        ) : (
          history.map((entry) => (
            <StatRow
              key={entry.date}
              label={`${formatDay(entry.date, strings, language)} · ${s.items[entry.challenge.id].title}`}
              value={entry.verified ? '✓' : strings.common.selfReported}
              valueColor={colors.progress}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  flex: { flex: 1, gap: 2 },
  list: { gap: spacing.sm },
  done: { borderColor: colors.progress },
  locked: { opacity: 0.6 },
});
