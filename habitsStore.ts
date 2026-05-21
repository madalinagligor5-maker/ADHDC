import { create } from 'zustand';

import { deleteHabit, insertHabit, listHabitLogs, listHabits, setHabitLog } from '@/db/habitsRepo';
import type { Habit, HabitLog, NewHabitInput } from '@/features/habits/types';
import { toISODate } from '@/utils/date';

interface HabitsState {
  habits: Habit[];
  logs: HabitLog[];
  loaded: boolean;
  load: () => Promise<void>;
  addHabit: (input: NewHabitInput) => Promise<Habit>;
  removeHabit: (id: string) => Promise<void>;
  toggleLog: (habitId: string, date: Date) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  logs: [],
  loaded: false,

  load: async () => {
    const [habits, logs] = await Promise.all([listHabits(), listHabitLogs()]);
    set({ habits, logs, loaded: true });
  },

  addHabit: async (input) => {
    const habit = await insertHabit(input);
    set((state) => ({ habits: [...state.habits, habit] }));
    return habit;
  },

  removeHabit: async (id) => {
    await deleteHabit(id);
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
      logs: state.logs.filter((l) => l.habitId !== id),
    }));
  },

  toggleLog: async (habitId, date) => {
    const iso = toISODate(date);
    const exists = get().logs.some((l) => l.habitId === habitId && l.date === iso);
    await setHabitLog(habitId, iso, !exists);
    set((state) => ({
      logs: exists
        ? state.logs.filter((l) => !(l.habitId === habitId && l.date === iso))
        : [...state.logs, { habitId, date: iso }],
    }));
  },
}));
