import { create } from 'zustand';

import { deleteTask, insertTask, listTasks, setTaskCompleted, updateTask } from '@/db/tasksRepo';
import type { NewTaskInput, Task } from '@/features/tasks/types';
import { addDays, startOfDay, toISODate } from '@/utils/date';

interface TasksState {
  tasks: Task[];
  loaded: boolean;
  load: () => Promise<void>;
  addTask: (input: NewTaskInput) => Promise<Task>;
  toggleTask: (id: string) => Promise<void>;
  editTask: (id: string, fields: Parameters<typeof updateTask>[1]) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  /** Push a task's due date forward by one day (gentle "snooze"). */
  snoozeTask: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loaded: false,

  load: async () => {
    const tasks = await listTasks();
    set({ tasks, loaded: true });
  },

  addTask: async (input) => {
    const task = await insertTask(input);
    set((state) => ({ tasks: [...state.tasks, task] }));
    return task;
  },

  toggleTask: async (id) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) return;
    const completed = !current.completed;
    await setTaskCompleted(id, completed);
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, completed, completedAt: completed ? new Date().toISOString() : null }
          : task,
      ),
    }));
  },

  editTask: async (id, fields) => {
    await updateTask(id, fields);
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...fields } : task)),
    }));
  },

  removeTask: async (id) => {
    await deleteTask(id);
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id && task.parentId !== id),
    }));
  },

  snoozeTask: async (id) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) return;
    const base = current.dueDate ? new Date(`${current.dueDate}T00:00:00`) : startOfDay(new Date());
    const next = toISODate(addDays(base, 1));
    await updateTask(id, { dueDate: next });
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, dueDate: next } : task)),
    }));
  },
}));
