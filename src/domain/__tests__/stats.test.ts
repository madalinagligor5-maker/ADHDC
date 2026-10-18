import { describe, expect, it } from '@jest/globals';

import { pickDailyChallenge, eligibleChallenges, extraChallenges } from '../challenges';
import { addDays, lastNDays } from '../date';
import { currentStreak, dayScore } from '../stats';
import { emptyDay, type DayRecord } from '../types';

const settings = { dailyLimitMin: 60, trackedApps: ['tiktok', 'instagram'] as const };
const tracked = [...settings.trackedApps];

function day(date: string, minutes: number, challengeCompleted = false): DayRecord {
  return { ...emptyDay(date), usage: { tiktok: minutes }, hasUsage: true, challengeCompleted };
}

describe('dayScore', () => {
  it('returns null when there is no usage yet', () => {
    expect(dayScore(undefined, { ...settings, trackedApps: tracked })).toBeNull();
    expect(dayScore(emptyDay('2026-01-01'), { ...settings, trackedApps: tracked })).toBeNull();
  });

  it('only counts tracked apps', () => {
    const record = { ...emptyDay('2026-01-01'), usage: { tiktok: 30, youtube: 500 }, hasUsage: true };
    expect(dayScore(record, { ...settings, trackedApps: tracked })?.score).toBe(100);
  });
});

describe('currentStreak', () => {
  const today = '2026-03-10';
  const s = { ...settings, trackedApps: tracked };

  it('counts consecutive days that respected the limit or completed the challenge', () => {
    const days = {
      [addDays(today, -3)]: day(addDays(today, -3), 200),
      [addDays(today, -2)]: day(addDays(today, -2), 30),
      [addDays(today, -1)]: day(addDays(today, -1), 120, true),
      [today]: day(today, 10),
    };
    expect(currentStreak(days, today, s)).toBe(3);
  });

  it('does not break the streak while today is still in progress', () => {
    const days = {
      [addDays(today, -1)]: day(addDays(today, -1), 30),
      [today]: day(today, 90),
    };
    expect(currentStreak(days, today, s)).toBe(1);
  });

  it('is zero without data', () => {
    expect(currentStreak({}, today, s)).toBe(0);
  });
});

describe('challenges', () => {
  it('picks the same challenge for the same day', () => {
    expect(pickDailyChallenge('2026-05-01', tracked).id).toBe(pickDailyChallenge('2026-05-01', tracked).id);
  });

  it('never picks a challenge for an untracked app', () => {
    for (const date of lastNDays(60, '2026-05-01')) {
      expect(pickDailyChallenge(date, ['instagram']).requiresApp).not.toBe('tiktok');
    }
    expect(eligibleChallenges(['instagram']).some((c) => c.requiresApp === 'youtube')).toBe(false);
  });

  it('extra challenges exclude the daily one', () => {
    const daily = pickDailyChallenge('2026-05-01', tracked);
    expect(extraChallenges('2026-05-01', tracked, 2).map((c) => c.id)).not.toContain(daily.id);
  });
});

describe('dates', () => {
  it('handles month boundaries', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(lastNDays(3, '2026-01-01')).toEqual(['2025-12-30', '2025-12-31', '2026-01-01']);
  });
});
