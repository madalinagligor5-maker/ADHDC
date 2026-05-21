import { createId } from '@/utils/id';
import type { NewProjectInput, Project } from '@/features/projects/types';
import { getDb } from './database';

interface ProjectRow {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

function fromRow(row: ProjectRow): Project {
  return { id: row.id, name: row.name, color: row.color, createdAt: row.created_at };
}

export async function listProjects(): Promise<Project[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ProjectRow>('SELECT * FROM projects ORDER BY created_at ASC');
  return rows.map(fromRow);
}

export async function insertProject(input: NewProjectInput): Promise<Project> {
  const db = await getDb();
  const project: Project = {
    id: createId(),
    name: input.name.trim(),
    color: input.color,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync('INSERT INTO projects (id, name, color, created_at) VALUES (?, ?, ?, ?)', [
    project.id,
    project.name,
    project.color,
    project.createdAt,
  ]);
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDb();
  // Keep the tasks but detach them from the deleted project.
  await db.runAsync('UPDATE tasks SET project_id = NULL WHERE project_id = ?', [id]);
  await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
}
