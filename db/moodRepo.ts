import { createId } from '@/utils/id';
import type { MoodEntry, MoodLevel, NewMoodEntry } from '@/features/mood/types';
import { getDb } from './database';

interface MoodRow {
  id: string;
  level: number;
  note: string | null;
  created_at: string;
}

function fromRow(row: MoodRow): MoodEntry {
  return {
    id: row.id,
    level: row.level as MoodLevel,
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function listMoodEntries(): Promise<MoodEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MoodRow>('SELECT * FROM mood_entries ORDER BY created_at DESC');
  return rows.map(fromRow);
}

export async function insertMoodEntry(input: NewMoodEntry): Promise<MoodEntry> {
  const db = await getDb();
  const entry: MoodEntry = {
    id: createId(),
    level: input.level,
    note: input.note ?? null,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync('INSERT INTO mood_entries (id, level, note, created_at) VALUES (?, ?, ?, ?)', [
    entry.id,
    entry.level,
    entry.note,
    entry.createdAt,
  ]);
  return entry;
}

export async function deleteMoodEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM mood_entries WHERE id = ?', [id]);
}
