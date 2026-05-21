import * as SQLite from 'expo-sqlite';

const DB_NAME = 'adhdcal.db';
const DATABASE_VERSION = 5;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Opens (once) the app database and runs migrations. Offline-first: all data
 * lives locally. The sync layer can later replay the same tables to a server.
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        notes TEXT,
        category TEXT NOT NULL DEFAULT 'personal',
        priority TEXT NOT NULL DEFAULT 'medium',
        due_date TEXT,
        time TEXT,
        estimated_minutes INTEGER,
        parent_id TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks (parent_id);');
    version = 1;
  }

  if (version < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    await db.execAsync('ALTER TABLE tasks ADD COLUMN project_id TEXT;');
    version = 2;
  }

  if (version < 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        mode TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL,
        ended_at TEXT NOT NULL
      );
    `);
    await db.execAsync(
      'CREATE INDEX IF NOT EXISTS idx_focus_ended_at ON focus_sessions (ended_at);',
    );
    version = 3;
  }

  if (version < 4) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'sparkles',
        reminder_time TEXT,
        created_at TEXT NOT NULL
      );
    `);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habit_logs (
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (habit_id, date)
      );
    `);
    version = 4;
  }

  if (version < 5) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id TEXT PRIMARY KEY NOT NULL,
        level INTEGER NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL
      );
    `);
    await db.execAsync(
      'CREATE INDEX IF NOT EXISTS idx_mood_created_at ON mood_entries (created_at);',
    );
    version = 5;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
}
