import { currentStreak as habitStreak, doneDates } from '@/features/habits/selectors';
import type { Habit } from '@/features/habits/types';
import { toISODate } from '@/utils/date';
import { activityDates, currentStreak, type ActivityInput } from './streak';

export interface GameStats {
  points: number;
  level: number;
  /** Points earned within the current level. */
  intoLevel: number;
  /** Points needed to span the current level. */
  levelSpan: number;
  /** 0..1 progress to the next level. */
  levelProgress: number;
  tasksCompleted: number;
  focusCount: number;
  moodCount: number;
  activityStreak: number;
  focusStreak: number;
  bestHabitStreak: number;
}

const POINTS = { task: 5, focus: 15, habit: 8, mood: 3 } as const;

/** Growing per-level cost: 100, 150, 200, … keeps early wins quick. */
export function computeLevel(points: number): {
  level: number;
  intoLevel: number;
  levelSpan: number;
  progress: number;
} {
  let level = 1;
  let acc = 0;
  let need = 100;
  while (points >= acc + need) {
    acc += need;
    level += 1;
    need = 100 + (level - 1) * 50;
  }
  const intoLevel = points - acc;
  return { level, intoLevel, levelSpan: need, progress: need > 0 ? intoLevel / need : 0 };
}

export function computeStats(input: ActivityInput & { habits: Habit[] }): GameStats {
  const tasksCompleted = input.tasks.filter((t) => t.completed).length;
  const focusCount = input.focusSessions.filter((s) => s.completed).length;
  const moodCount = input.moodEntries.length;

  const points =
    tasksCompleted * POINTS.task +
    focusCount * POINTS.focus +
    input.habitLogs.length * POINTS.habit +
    moodCount * POINTS.mood;

  const { level, intoLevel, levelSpan, progress } = computeLevel(points);

  const focusDates = new Set(
    input.focusSessions.filter((s) => s.completed).map((s) => toISODate(new Date(s.endedAt))),
  );
  const bestHabitStreak = input.habits.reduce(
    (max, habit) => Math.max(max, habitStreak(doneDates(input.habitLogs, habit.id))),
    0,
  );

  return {
    points,
    level,
    intoLevel,
    levelSpan,
    levelProgress: progress,
    tasksCompleted,
    focusCount,
    moodCount,
    activityStreak: currentStreak(activityDates(input)),
    focusStreak: currentStreak(focusDates),
    bestHabitStreak,
  };
}
