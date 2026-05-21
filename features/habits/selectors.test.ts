import { addDays, toISODate } from '@/utils/date';
import { currentStreak, doneDates } from './selectors';
import type { HabitLog } from './types';

const today = new Date(2026, 4, 20);
const iso = (offset: number) => toISODate(addDays(today, offset));

describe('habits selectors', () => {
  test('doneDates filters by habit', () => {
    const logs: HabitLog[] = [
      { habitId: 'a', date: iso(0) },
      { habitId: 'b', date: iso(0) },
      { habitId: 'a', date: iso(-1) },
    ];
    const set = doneDates(logs, 'a');
    expect(set.size).toBe(2);
    expect(set.has(iso(0))).toBe(true);
  });

  test('currentStreak counts the chain', () => {
    const set = new Set([iso(0), iso(-1)]);
    expect(currentStreak(set, today)).toBe(2);
  });
});
