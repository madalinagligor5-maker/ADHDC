import { useEffect, useMemo, useState } from 'react';

import { activeChallenge } from '@/domain/challenges';
import { todayKey, type DateKey } from '@/domain/date';
import { buildDemoDays, buildDemoPauses, DEMO_LIMIT } from '@/domain/demo';
import type { PauseSession } from '@/domain/pause';
import { currentStreak, dayMinutes, dayScore, type DaysById } from '@/domain/stats';
import type { DayRecord } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

/** Today's date key, refreshed when the day rolls over (or the time zone changes) while open. */
export function useTodayKey(): DateKey {
  const [key, setKey] = useState(todayKey);
  useEffect(() => {
    const timer = setInterval(() => {
      const next = todayKey();
      setKey((previous) => (previous === next ? previous : next));
    }, 30_000);
    return () => clearInterval(timer);
  }, []);
  return key;
}

export interface DataView {
  isDemo: boolean;
  days: DaysById;
  pauses: PauseSession[];
  /** Limit used for days that have no record yet. */
  currentLimitMin: number;
}

/** Real data, or the clearly-labelled demo dataset. Screens never mix the two. */
export function useDataView(): DataView {
  const today = useTodayKey();
  const demo = useAppStore((state) => state.demo);
  const days = useAppStore((state) => state.days);
  const pauses = useAppStore((state) => state.pauses);
  const limit = useAppStore((state) => state.settings.dailyLimitMin);

  return useMemo(
    () =>
      demo
        ? { isDemo: true, days: buildDemoDays(today), pauses: buildDemoPauses(today), currentLimitMin: DEMO_LIMIT }
        : { isDemo: false, days, pauses, currentLimitMin: limit },
    [demo, today, days, pauses, limit],
  );
}

export interface TodaySummary extends DataView {
  date: DateKey;
  day: DayRecord | undefined;
  minutes: number | null;
  score: number | null;
  limitMin: number;
  streak: number;
  challenge: ReturnType<typeof activeChallenge>;
}

export function useToday(): TodaySummary {
  const date = useTodayKey();
  const view = useDataView();
  return useMemo(() => {
    const day = view.days[date];
    return {
      ...view,
      date,
      day,
      minutes: dayMinutes(day),
      score: dayScore(day),
      limitMin: day?.limitMin ?? view.currentLimitMin,
      streak: currentStreak(view.days, date),
      challenge: activeChallenge(date, day?.challengeId),
    };
  }, [view, date]);
}
