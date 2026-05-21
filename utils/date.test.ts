import {
  addDays,
  addMonths,
  formatTime,
  isSameDay,
  monthMatrix,
  startOfWeek,
  toISODate,
  weekDays,
  weekStartsOnForLocale,
} from './date';

describe('date utils', () => {
  test('toISODate formats local date as YYYY-MM-DD', () => {
    expect(toISODate(new Date(2026, 4, 20))).toBe('2026-05-20');
    expect(toISODate(new Date(2026, 0, 3))).toBe('2026-01-03');
  });

  test('addDays / addMonths', () => {
    expect(toISODate(addDays(new Date(2026, 4, 20), 5))).toBe('2026-05-25');
    expect(toISODate(addDays(new Date(2026, 4, 1), -1))).toBe('2026-04-30');
    expect(addMonths(new Date(2026, 4, 20), 1).getMonth()).toBe(5);
  });

  test('startOfWeek respects week start', () => {
    // 2026-05-20 is a Wednesday.
    const wed = new Date(2026, 4, 20);
    expect(startOfWeek(wed, 1).getDay()).toBe(1); // Monday
    expect(startOfWeek(wed, 0).getDay()).toBe(0); // Sunday
  });

  test('weekStartsOnForLocale', () => {
    expect(weekStartsOnForLocale('en')).toBe(0);
    expect(weekStartsOnForLocale('en-US')).toBe(0);
    expect(weekStartsOnForLocale('ro')).toBe(1);
    expect(weekStartsOnForLocale('fr')).toBe(1);
  });

  test('weekDays returns 7 consecutive days', () => {
    const days = weekDays(new Date(2026, 4, 20), 1);
    expect(days).toHaveLength(7);
    expect(days[0]?.getDay()).toBe(1);
  });

  test('monthMatrix is a padded 6x7 grid', () => {
    const grid = monthMatrix(new Date(2026, 4, 1), 1);
    expect(grid).toHaveLength(6);
    expect(grid.every((w) => w.length === 7)).toBe(true);
  });

  test('isSameDay', () => {
    expect(isSameDay(new Date(2026, 4, 20, 9), new Date(2026, 4, 20, 22))).toBe(true);
    expect(isSameDay(new Date(2026, 4, 20), new Date(2026, 4, 21))).toBe(false);
  });

  test('formatTime is 24h for ro, not 24h for en', () => {
    expect(formatTime('13:00', 'ro')).toBe('13:00');
    expect(formatTime('13:00', 'en')).not.toBe('13:00');
  });
});
