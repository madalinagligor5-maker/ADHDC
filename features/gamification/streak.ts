import type { FocusSession } from '@/features/focus';
import type { HabitLog } from '@/features/habits';
import type { MoodEntry } from '@/features/mood';
import type { Task } from '@/features/tasks';
import { addDays, startOfDay, toISODate } from '@/utils/date';

export interface ActivityInput {
  tasks: Task[];
  focusSessions: FocusSession[];
  habitLogs: HabitLog[];
  moodEntries: MoodEntry[];
}

/** Every ISO date the user did *something* (completed a task, focused, kept a
 * habit, or checked in on their mood). Powers streaks and the garden. */
export function activityDates(input: ActivityInput): Set<string> {
  const set = new Set<string>();
  for (const task of input.tasks) {
    if (task.completedAt) set.add(toISODate(new Date(task.completedAt)));
  }
  for (const session of input.focusSessions) {
    if (session.completed) set.add(toISODate(new Date(session.endedAt)));
  }
  for (const log of input.habitLogs) set.add(log.date);
  for (const entry of input.moodEntries) set.add(toISODate(new Date(entry.createdAt)));
  return set;
}

/** Consecutive days of activity ending today (or yesterday, so it isn't
 * "broken" mid-day). Never punishing. */
export function currentStreak(dates: Set<string>, today = new Date()): number {
  const start = startOfDay(today);
  let cursor = dates.has(toISODate(start)) ? start : addDays(start, -1);
  let streak = 0;
  while (dates.has(toISODate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
