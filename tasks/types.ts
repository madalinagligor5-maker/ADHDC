export type TaskCategory = 'work' | 'school' | 'personal';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  notes: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  /** ISO `YYYY-MM-DD`, or null for an undated "brain dump" item. */
  dueDate: string | null;
  /** `HH:mm` 24h scheduled time, or null. */
  time: string | null;
  estimatedMinutes: number | null;
  /** Sub-task decomposition: points at the parent task id. */
  parentId: string | null;
  /** Optional project/list this task belongs to. */
  projectId: string | null;
  completed: boolean;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface NewTaskInput {
  title: string;
  notes?: string | null;
  category?: TaskCategory;
  priority?: TaskPriority;
  dueDate?: string | null;
  time?: string | null;
  estimatedMinutes?: number | null;
  parentId?: string | null;
  projectId?: string | null;
}

export const TASK_CATEGORIES: TaskCategory[] = ['work', 'school', 'personal'];
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
