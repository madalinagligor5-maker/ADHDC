import type { GameStats } from './stats';

export type BadgeId =
  | 'firstTask'
  | 'firstFocus'
  | 'streak3'
  | 'streak7'
  | 'focus10'
  | 'habit7'
  | 'mood7'
  | 'tasks25';

export interface Badge {
  id: BadgeId;
  unlocked: boolean;
}

const RULES: Record<BadgeId, (s: GameStats) => boolean> = {
  firstTask: (s) => s.tasksCompleted >= 1,
  firstFocus: (s) => s.focusCount >= 1,
  streak3: (s) => s.activityStreak >= 3,
  streak7: (s) => s.activityStreak >= 7,
  focus10: (s) => s.focusCount >= 10,
  habit7: (s) => s.bestHabitStreak >= 7,
  mood7: (s) => s.moodCount >= 7,
  tasks25: (s) => s.tasksCompleted >= 25,
};

export const BADGE_IDS = Object.keys(RULES) as BadgeId[];

export function computeBadges(stats: GameStats): Badge[] {
  return BADGE_IDS.map((id) => ({ id, unlocked: RULES[id](stats) }));
}
