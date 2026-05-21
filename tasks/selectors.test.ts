import { toISODate } from '@/utils/date';
import {
  projectGroups,
  subtaskProgress,
  tasksForDate,
  topLevelTasks,
  upcomingGroups,
} from './selectors';
import type { Task } from './types';

let counter = 0;
function makeTask(partial: Partial<Task> = {}): Task {
  counter += 1;
  return {
    id: `t${counter}`,
    title: `Task ${counter}`,
    notes: null,
    category: 'personal',
    priority: 'medium',
    dueDate: null,
    time: null,
    estimatedMinutes: null,
    parentId: null,
    projectId: null,
    completed: false,
    completedAt: null,
    sortOrder: counter,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

const today = toISODate(new Date());

describe('tasks selectors', () => {
  test('topLevelTasks excludes sub-tasks', () => {
    const tasks = [makeTask(), makeTask({ parentId: 't1' })];
    expect(topLevelTasks(tasks)).toHaveLength(1);
  });

  test('tasksForDate filters by due date and sorts timed first', () => {
    const tasks = [
      makeTask({ dueDate: today, time: '15:00' }),
      makeTask({ dueDate: today, time: '09:00' }),
      makeTask({ dueDate: today, time: null }),
      makeTask({ dueDate: '2099-01-01' }),
    ];
    const result = tasksForDate(tasks, new Date());
    expect(result).toHaveLength(3);
    expect(result[0]?.time).toBe('09:00');
    expect(result[1]?.time).toBe('15:00');
    expect(result[2]?.time).toBeNull();
  });

  test('subtaskProgress counts completed children', () => {
    const tasks = [
      makeTask({ id: 'p' }),
      makeTask({ parentId: 'p', completed: true }),
      makeTask({ parentId: 'p', completed: false }),
    ];
    expect(subtaskProgress(tasks, 'p')).toEqual({ done: 1, total: 2 });
  });

  test('upcomingGroups groups future tasks by date', () => {
    const tasks = [
      makeTask({ dueDate: today }),
      makeTask({ dueDate: '2099-01-01' }),
      makeTask({ dueDate: '2099-01-02' }),
    ];
    const groups = upcomingGroups(tasks);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.date).toBe('2099-01-01');
  });

  test('projectGroups puts unprojected tasks in the inbox first', () => {
    const tasks = [makeTask(), makeTask({ projectId: 'proj' })];
    const groups = projectGroups(tasks);
    expect(groups[0]?.projectId).toBeNull();
    expect(groups.find((g) => g.projectId === 'proj')?.tasks).toHaveLength(1);
  });
});
