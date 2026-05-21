import type { FocusSession } from '@/features/focus/types';
import type { MoodEntry } from '@/features/mood/types';
import type { Task } from '@/features/tasks/types';
import { computeBadges } from './badges';
import { computeLevel, computeStats } from './stats';

describe('computeLevel', () => {
  test('starts at level 1', () => {
    const l = computeLevel(0);
    expect(l.level).toBe(1);
    expect(l.intoLevel).toBe(0);
    expect(l.levelSpan).toBe(100);
  });

  test('reaches level 2 after the first 100 points', () => {
    expect(computeLevel(99).level).toBe(1);
    expect(computeLevel(100).level).toBe(2);
  });

  test('progress is between 0 and 1', () => {
    const l = computeLevel(50);
    expect(l.progress).toBeGreaterThan(0);
    expect(l.progress).toBeLessThan(1);
  });
});

describe('computeStats + badges', () => {
  const base = { habitLogs: [], habits: [] };

  test('points combine activity', () => {
    const tasks = [{ completed: true }, { completed: true }] as unknown as Task[];
    const focusSessions = [
      { completed: true, endedAt: new Date().toISOString() },
    ] as unknown as FocusSession[];
    const stats = computeStats({ ...base, tasks, focusSessions, moodEntries: [] });
    expect(stats.tasksCompleted).toBe(2);
    expect(stats.focusCount).toBe(1);
    expect(stats.points).toBe(2 * 5 + 1 * 15);
  });

  test('badges unlock from thresholds', () => {
    const tasks = [{ completed: true }] as unknown as Task[];
    const focusSessions = [
      { completed: true, endedAt: new Date().toISOString() },
    ] as unknown as FocusSession[];
    const moodEntries = [] as MoodEntry[];
    const stats = computeStats({ ...base, tasks, focusSessions, moodEntries });
    const badges = computeBadges(stats);
    const unlocked = (id: string) => badges.find((b) => b.id === id)?.unlocked;
    expect(unlocked('firstTask')).toBe(true);
    expect(unlocked('firstFocus')).toBe(true);
    expect(unlocked('tasks25')).toBe(false);
  });
});
