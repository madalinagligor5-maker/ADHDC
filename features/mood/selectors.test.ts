import { dailyMoodAverages, hasCheckedInToday } from './selectors';
import type { MoodEntry } from './types';

function entry(level: 1 | 2 | 3 | 4 | 5, date: Date): MoodEntry {
  return { id: Math.random().toString(), level, note: null, createdAt: date.toISOString() };
}

describe('mood selectors', () => {
  test('dailyMoodAverages returns one slot per day, today last', () => {
    const result = dailyMoodAverages([], 7);
    expect(result).toHaveLength(7);
    expect(result.every((d) => d.average === null)).toBe(true);
  });

  test('averages multiple entries on the same day', () => {
    const today = new Date();
    const result = dailyMoodAverages([entry(2, today), entry(4, today)], 7);
    expect(result[result.length - 1]?.average).toBe(3);
  });

  test('hasCheckedInToday', () => {
    expect(hasCheckedInToday([])).toBe(false);
    expect(hasCheckedInToday([entry(5, new Date())])).toBe(true);
  });
});
