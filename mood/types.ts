import type { MoodLevel } from '@/components/ui';

export type { MoodLevel };

export interface MoodEntry {
  id: string;
  level: MoodLevel;
  note: string | null;
  createdAt: string;
}

export interface NewMoodEntry {
  level: MoodLevel;
  note?: string | null;
}
