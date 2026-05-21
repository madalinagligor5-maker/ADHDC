import type { ThemeColors } from '@/theme';
import type { TaskCategory, TaskPriority } from './types';

/** Each category maps to a theme color token so it adapts to light/dark. */
export const CATEGORY_COLOR_KEY: Record<TaskCategory, keyof ThemeColors> = {
  work: 'primary',
  school: 'teal',
  personal: 'coral',
};

/**
 * Priority flag color. `low` has no flag (returns null) to keep the UI calm —
 * only medium/high get a gentle visual marker.
 */
export const PRIORITY_COLOR_KEY: Record<TaskPriority, keyof ThemeColors | null> = {
  low: null,
  medium: 'mustard',
  high: 'coral',
};
