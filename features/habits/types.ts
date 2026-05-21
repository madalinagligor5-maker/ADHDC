export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  /** `HH:mm` reminder time, or null. */
  reminderTime: string | null;
  createdAt: string;
}

export interface NewHabitInput {
  name: string;
  color: string;
  icon: string;
  reminderTime?: string | null;
}

/** A completion record: a habit was done on a given ISO `YYYY-MM-DD` day. */
export interface HabitLog {
  habitId: string;
  date: string;
}

export const HABIT_COLORS = ['#6C5CE7', '#3FB6A8', '#FF8A80', '#F4C95D', '#1E8A5F', '#9A8BFF'];
