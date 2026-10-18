import { hashString, type DateKey } from './date';

export type ChallengeId = 'pause-20' | 'phone-free-meal' | 'read-10' | 'short-walk';

export interface Challenge {
  id: ChallengeId;
  icon: 'pause-circle-outline' | 'restaurant-outline' | 'book-outline' | 'walk-outline';
  /**
   * `pause` challenges are confirmed by the app when a long-enough pause ends.
   * Everything else is self-reported: the app cannot verify steps, meals or reading.
   */
  verification: { kind: 'pause'; minMinutes: number } | { kind: 'self' };
}

export const CHALLENGES: Challenge[] = [
  { id: 'pause-20', icon: 'pause-circle-outline', verification: { kind: 'pause', minMinutes: 20 } },
  { id: 'phone-free-meal', icon: 'restaurant-outline', verification: { kind: 'self' } },
  { id: 'read-10', icon: 'book-outline', verification: { kind: 'self' } },
  { id: 'short-walk', icon: 'walk-outline', verification: { kind: 'self' } },
];

export function getChallenge(id: string | null | undefined): Challenge | undefined {
  return CHALLENGES.find((challenge) => challenge.id === id);
}

/** Deterministic suggestion for a day (free plan: one challenge per day). */
export function dailyChallenge(date: DateKey): Challenge {
  return CHALLENGES[hashString(date) % CHALLENGES.length];
}

/** The challenge active on a day: the one the user picked, or the daily suggestion. */
export function activeChallenge(date: DateKey, pickedId: string | null | undefined): Challenge {
  return getChallenge(pickedId) ?? dailyChallenge(date);
}
