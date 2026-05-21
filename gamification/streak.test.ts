import type { FocusSession } from '@/features/focus/types';
import type { HabitLog } from '@/features/habits/types';
import type { MoodEntry } from '@/features/mood/types';
import type { Task } from '@/features/tasks/types';
import { addDays, toISODate } from '@/utils/date';
import { activityDates, currentStreak } from './streak';

const today = new Date(2026, 4, 20);
const iso = (offset: number) => toISODate(addDays(today, offset));

describe('currentStreak', () => {
  test('counts consecutive days ending today', () => {
    const set = new Set([iso(0), iso(-1), iso(-2)]);
    expect(currentStreak(set, today)).toBe(3);
  });

  test('still counts when today is missing but yesterday is present', () => {
    const set = new Set([iso(-1), iso(-2)]);
    expect(currentStreak(set, today)).toBe(2);
  });

  test('breaks on a gap', () => {
    const set = new Set([iso(0), iso(-2)]);
    expect(currentStreak(set, today)).toBe(1);
  });

  test('empty set is zero', () => {
    expect(currentStreak(new Set(), today)).toBe(0);
  });
});

describe('activityDates', () => {
  test('collects dates from every activity type', () => {
    const tasks = [{ completedAt: today.toISOString() }] as unknown as Task[];
    const focusSessions = [
      { completed: true, endedAt: addDays(today, -1).toISOString() },
    ] as unknown as FocusSession[];
    const habitLogs = [{ habitId: 'h', date: iso(-2) }] as HabitLog[];
    const moodEntries = [{ createdAt: addDays(today, -3).toISOString() }] as unknown as MoodEntry[];

    const dates = activityDates({ tasks, focusSessions, habitLogs, moodEntries });
    expect(dates.has(iso(0))).toBe(true);
    expect(dates.has(iso(-1))).toBe(true);
    expect(dates.has(iso(-2))).toBe(true);
    expect(dates.has(iso(-3))).toBe(true);
  });

  test('ignores incomplete focus sessions', () => {
    const focusSessions = [
      { completed: false, endedAt: today.toISOString() },
    ] as unknown as FocusSession[];
    const dates = activityDates({ tasks: [], focusSessions, habitLogs: [], moodEntries: [] });
    expect(dates.size).toBe(0);
  });
});
