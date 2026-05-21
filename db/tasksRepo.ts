import { createId } from '@/utils/id';
import type { NewTaskInput, Task, TaskCategory, TaskPriority } from '@/features/tasks/types';
import { getDb } from './database';

interface TaskRow {
  id: string;
  title: string;
  notes: string | null;
  category: string;
  priority: string;
  due_date: string | null;
  time: string | null;
  estimated_minutes: number | null;
  parent_id: string | null;
  project_id: string | null;
  completed: number;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
}

function fromRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    category: row.category as TaskCategory,
    priority: row.priority as TaskPriority,
    dueDate: row.due_date,
    time: row.time,
    estimatedMinutes: row.estimated_minutes,
    parentId: row.parent_id,
    projectId: row.project_id,
    completed: row.completed === 1,
    completedAt: row.completed_at,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export async function listTasks(): Promise<Task[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TaskRow>(
    'SELECT * FROM tasks ORDER BY sort_order ASC, created_at ASC',
  );
  return rows.map(fromRow);
}

export async function insertTask(input: NewTaskInput): Promise<Task> {
  const db = await getDb();
  const task: Task = {
    id: createId(),
    title: input.title.trim(),
    notes: input.notes ?? null,
    category: input.category ?? 'personal',
    priority: input.priority ?? 'medium',
    dueDate: input.dueDate ?? null,
    time: input.time ?? null,
    estimatedMinutes: input.estimatedMinutes ?? null,
    parentId: input.parentId ?? null,
    projectId: input.projectId ?? null,
    completed: false,
    completedAt: null,
    sortOrder: Date.now(),
    createdAt: new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO tasks
      (id, title, notes, category, priority, due_date, time, estimated_minutes, parent_id, project_id, completed, completed_at, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.title,
      task.notes,
      task.category,
      task.priority,
      task.dueDate,
      task.time,
      task.estimatedMinutes,
      task.parentId,
      task.projectId,
      task.completed ? 1 : 0,
      task.completedAt,
      task.sortOrder,
      task.createdAt,
    ],
  );
  return task;
}

export async function setTaskCompleted(id: string, completed: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ?', [
    completed ? 1 : 0,
    completed ? new Date().toISOString() : null,
    id,
  ]);
}

export async function updateTask(
  id: string,
  fields: Partial<
    Pick<
      Task,
      | 'title'
      | 'notes'
      | 'category'
      | 'priority'
      | 'dueDate'
      | 'time'
      | 'estimatedMinutes'
      | 'projectId'
    >
  >,
): Promise<void> {
  const db = await getDb();
  const map: Record<string, string> = {
    title: 'title',
    notes: 'notes',
    category: 'category',
    priority: 'priority',
    dueDate: 'due_date',
    time: 'time',
    estimatedMinutes: 'estimated_minutes',
    projectId: 'project_id',
  };
  const entries = Object.entries(fields).filter(([key]) => key in map);
  if (entries.length === 0) return;
  const setClause = entries.map(([key]) => `${map[key]} = ?`).join(', ');
  const values = entries.map(([, value]) => value as string | number | null);
  await db.runAsync(`UPDATE tasks SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM tasks WHERE id = ? OR parent_id = ?', [id, id]);
}
