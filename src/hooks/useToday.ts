import { useEffect, useMemo, useState } from 'react';

import { topApps } from '@/domain/apps';
import { pickDailyChallenge } from '@/domain/challenges';
import { todayKey } from '@/domain/date';
import { currentStreak, dayMinutes, dayScore } from '@/domain/stats';
import { useAppStore } from '@/store/useAppStore';

/** Today's date key, refreshed when the day rolls over while the app is open. */
export function useTodayKey(): string {
  const [key, setKey] = useState(todayKey);
  useEffect(() => {
    const timer = setInterval(() => {
      const next = todayKey();
      setKey((previous) => (previous === next ? previous : next));
    }, 60_000);
    return () => clearInterval(timer);
  }, []);
  return key;
}

/** Everything the dashboard needs about today, derived from the store. */
export function useToday() {
  const date = useTodayKey();
  const days = useAppStore((state) => state.days);
  const settings = useAppStore((state) => state.settings);

  return useMemo(() => {
    const day = days[date];
    const challenge = pickDailyChallenge(date, settings.trackedApps);
    return {
      date,
      day,
      settings,
      challenge,
      challengeCompleted: Boolean(day?.challengeCompleted),
      minutes: dayMinutes(day, settings.trackedApps),
      top: day ? topApps(day.usage, settings.trackedApps) : [],
      score: dayScore(day, settings),
      streak: currentStreak(days, date, settings),
    };
  }, [date, days, settings]);
}
