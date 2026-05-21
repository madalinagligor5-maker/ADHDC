import { startOfDay, toISODate } from '@/utils/date';
import type { Task } from './types';

/** Top-level tasks only (excludes sub-tasks). */
export function topLevelTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.parentId === null);
}

/** Top-level tasks scheduled for a given day, sorted by time then order. */
export function tasksForDate(tasks: Task[], date: Date): Task[] {
  const iso = toISODate(date);
  return topLevelTasks(tasks)
    .filter((task) => task.dueDate === iso)
    .sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return a.sortOrder - b.sortOrder;
    });
}

/** Set of ISO dates that have at least one task (for week-strip dots). */
export function activeDates(tasks: Task[]): string[] {
  const set = new Set<string>();
  for (const task of tasks) {
    if (task.dueDate) set.add(task.dueDate);
  }
  return [...set];
}

export function subtasksOf(tasks: Task[], parentId: string): Task[] {
  return tasks
    .filter((task) => task.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export interface SubtaskProgress {
  done: number;
  total: number;
}

/** Completed/total counts of a task's sub-tasks. */
export function subtaskProgress(tasks: Task[], parentId: string): SubtaskProgress {
  const subs = subtasksOf(tasks, parentId);
  return { total: subs.length, done: subs.filter((s) => s.completed).length };
}

export interface DateGroup {
  /** ISO `YYYY-MM-DD`, or null for undated tasks. */
  date: string | null;
  tasks: Task[];
}

/** Top-level tasks due after today, grouped and ordered by date. */
export function upcomingGroups(tasks: Task[]): DateGroup[] {
  const todayIso = toISODate(startOfDay(new Date()));
  const map = new Map<string, Task[]>();
  for (const task of topLevelTasks(tasks)) {
    if (task.dueDate && task.dueDate > todayIso) {
      const bucket = map.get(task.dueDate) ?? [];
      bucket.push(task);
      map.set(task.dueDate, bucket);
    }
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({ date, tasks: sortByTime(list) }));
}

function sortByTime(list: Task[]): Task[] {
  return [...list].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return a.sortOrder - b.sortOrder;
  });
}

export interface ProjectGroup {
  /** Project id, or null for the inbox (no project). */
  projectId: string | null;
  tasks: Task[];
}

/** Top-level tasks grouped by project; inbox (null) first. */
export function projectGroups(tasks: Task[]): ProjectGroup[] {
  const inbox: Task[] = [];
  const byProject = new Map<string, Task[]>();
  for (const task of topLevelTasks(tasks)) {
    if (task.projectId) {
      const bucket = byProject.get(task.projectId) ?? [];
      bucket.push(task);
      byProject.set(task.projectId, bucket);
    } else {
      inbox.push(task);
    }
  }
  const groups: ProjectGroup[] = [{ projectId: null, tasks: inbox }];
  for (const [projectId, list] of byProject) {
    groups.push({ projectId, tasks: list });
  }
  return groups;
}
