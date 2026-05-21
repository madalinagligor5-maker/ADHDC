import { createId } from '@/utils/id';
import type { Habit, HabitLog, NewHabitInput } from '@/features/habits/types';
import { getDb } from './database';

interface HabitRow {
  id: string;
  name: string;
  color: string;
  icon: string;
  reminder_time: string | null;
  created_at: string;
}

interface LogRow {
  habit_id: string;
  date: string;
}

function fromRow(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    reminderTime: row.reminder_time,
    createdAt: row.created_at,
  };
}

export async function listHabits(): Promise<Habit[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<HabitRow>('SELECT * FROM habits ORDER BY created_at ASC');
  return rows.map(fromRow);
}

export async function listHabitLogs(): Promise<HabitLog[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<LogRow>('SELECT habit_id, date FROM habit_logs');
  return rows.map((r) => ({ habitId: r.habit_id, date: r.date }));
}

export async function insertHabit(input: NewHabitInput): Promise<Habit> {
  const db = await getDb();
  const habit: Habit = {
    id: createId(),
    name: input.name.trim(),
    color: input.color,
    icon: input.icon,
    reminderTime: input.reminderTime ?? null,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    'INSERT INTO habits (id, name, color, icon, reminder_time, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [habit.id, habit.name, habit.color, habit.icon, habit.reminderTime, habit.createdAt],
  );
  return habit;
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ?', [id]);
  await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
}

export async function setHabitLog(habitId: string, date: string, done: boolean): Promise<void> {
  const db = await getDb();
  if (done) {
    await db.runAsync(
      'INSERT OR IGNORE INTO habit_logs (habit_id, date, created_at) VALUES (?, ?, ?)',
      [habitId, date, new Date().toISOString()],
    );
  } else {
    await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?', [habitId, date]);
  }
}
