import { tasksForDate } from '@/features/tasks';
import type { Task } from '@/features/tasks';

export type DayLoad = 'free' | 'light' | 'balanced' | 'full';

/** Gentle, anti-overcommit day-load level based on incomplete task count. */
export function dayLoad(tasks: Task[], date: Date): DayLoad {
  const open = tasksForDate(tasks, date).filter((t) => !t.completed).length;
  if (open === 0) return 'free';
  if (open <= 2) return 'light';
  if (open <= 4) return 'balanced';
  return 'full';
}

/** Theme color token per load level. */
export const LOAD_COLOR_KEY: Record<DayLoad, 'textMuted' | 'teal' | 'mustard' | 'coral'> = {
  free: 'textMuted',
  light: 'teal',
  balanced: 'mustard',
  full: 'coral',
};

export function timedTasks(tasks: Task[], date: Date): Task[] {
  return tasksForDate(tasks, date).filter((t) => t.time !== null);
}

export function untimedTasks(tasks: Task[], date: Date): Task[] {
  return tasksForDate(tasks, date).filter((t) => t.time === null);
}
