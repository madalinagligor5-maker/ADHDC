import { describe, expect, it } from '@jest/globals';

import type { UsageMap } from '../apps';
import { addDays } from '../date';
import { buildSeries, compareAverages, currentStreak, dayMetGoal, dayScore, summarize } from '../stats';
import { emptyDay, type DayRecord } from '../types';

const TODAY = '2026-10-18';

function day(date: string, usage: UsageMap, limitMin = 60): DayRecord {
  return { ...emptyDay(date, limitMin), usage };
}

describe('day helpers', () => {
  it('scores with the limit stored on the day', () => {
    expect(dayScore(day(TODAY, { tiktok: 120 }, 60))).toBe(50);
    expect(dayScore(day(TODAY, { tiktok: 120 }, 120))).toBe(100);
  });

  it('never treats a day without data as a success', () => {
    expect(dayScore(emptyDay(TODAY, 60))).toBeNull();
    expect(dayMetGoal(emptyDay(TODAY, 60))).toBe(false);
    expect(dayMetGoal(day(TODAY, { tiktok: 0 }))).toBe(true);
  });
});

describe('currentStreak', () => {
  it('counts finished days with data and the goal met', () => {
    const days = {
      [addDays(TODAY, -3)]: day(addDays(TODAY, -3), { tiktok: 90 }),
      [addDays(TODAY, -2)]: day(addDays(TODAY, -2), { tiktok: 30 }),
      [addDays(TODAY, -1)]: day(addDays(TODAY, -1), { tiktok: 60 }),
    };
    expect(currentStreak(days, TODAY)).toBe(2);
  });

  it('does not count today before it ends', () => {
    expect(currentStreak({ [TODAY]: day(TODAY, { tiktok: 5 }) }, TODAY)).toBe(0);
  });

  it('is broken by a day without data', () => {
    const days = {
      [addDays(TODAY, -3)]: day(addDays(TODAY, -3), { tiktok: 10 }),
      [addDays(TODAY, -1)]: day(addDays(TODAY, -1), { tiktok: 10 }),
    };
    expect(currentStreak(days, TODAY)).toBe(1);
  });
});

describe('series and comparisons', () => {
  it('keeps no-data days as null, not zero', () => {
    const series = buildSeries({ [TODAY]: day(TODAY, { tiktok: 0 }) }, [addDays(TODAY, -1), TODAY]);
    expect(series[0].minutes).toBeNull();
    expect(series[0].score).toBeNull();
    expect(series[1].minutes).toBe(0);
    expect(series[1].score).toBe(100);
  });

  it('only compares periods with enough data', () => {
    const makeWeek = (end: string, minutes: number, count: number) =>
      Object.fromEntries(
        Array.from({ length: count }, (_, i) => {
          const date = addDays(end, -i);
          return [date, day(date, { tiktok: minutes })];
        }),
      );
    const keys = (end: string) => Array.from({ length: 7 }, (_, i) => addDays(end, -i));
    const prevEnd = addDays(TODAY, -7);

    const enough = { ...makeWeek(TODAY, 40, 5), ...makeWeek(prevEnd, 70, 5) };
    const diff = compareAverages(summarize(buildSeries(enough, keys(TODAY))), summarize(buildSeries(enough, keys(prevEnd))));
    expect(diff).toBe(30);

    const sparse = { ...makeWeek(TODAY, 40, 5), ...makeWeek(prevEnd, 70, 2) };
    expect(
      compareAverages(summarize(buildSeries(sparse, keys(TODAY))), summarize(buildSeries(sparse, keys(prevEnd)))),
    ).toBeNull();
  });
});
