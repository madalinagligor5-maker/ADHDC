import { createId } from '@/utils/id';
import type { FocusMode, FocusSession, NewFocusSession } from '@/features/focus/types';
import { getDb } from './database';

interface FocusRow {
  id: string;
  mode: string;
  duration_minutes: number;
  completed: number;
  started_at: string;
  ended_at: string;
}

function fromRow(row: FocusRow): FocusSession {
  return {
    id: row.id,
    mode: row.mode as FocusMode,
    durationMinutes: row.duration_minutes,
    completed: row.completed === 1,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

export async function listFocusSessions(): Promise<FocusSession[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<FocusRow>(
    'SELECT * FROM focus_sessions ORDER BY ended_at DESC',
  );
  return rows.map(fromRow);
}

export async function insertFocusSession(input: NewFocusSession): Promise<FocusSession> {
  const db = await getDb();
  const session: FocusSession = {
    id: createId(),
    mode: input.mode,
    durationMinutes: input.durationMinutes,
    completed: input.completed,
    startedAt: input.startedAt,
    endedAt: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO focus_sessions (id, mode, duration_minutes, completed, started_at, ended_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.mode,
      session.durationMinutes,
      session.completed ? 1 : 0,
      session.startedAt,
      session.endedAt,
    ],
  );
  return session;
}
