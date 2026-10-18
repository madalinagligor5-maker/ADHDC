import type { AppId } from './apps';
import { hashString, type DateKey } from './date';

export type ChallengeId =
  | 'no-tiktok-30'
  | 'no-reels-before-14'
  | 'no-shorts-after-21'
  | 'read-15'
  | 'steps-10k'
  | 'study-20'
  | 'phone-free-meal'
  | 'walk-20';

export type ChallengeCategory = 'detox' | 'mind' | 'body';

export interface Challenge {
  id: ChallengeId;
  category: ChallengeCategory;
  /** Only offered when this app is tracked. */
  requiresApp?: AppId;
  emoji: string;
}

export const CHALLENGES: Challenge[] = [
  { id: 'no-tiktok-30', category: 'detox', requiresApp: 'tiktok', emoji: '⏳' },
  { id: 'no-reels-before-14', category: 'detox', requiresApp: 'instagram', emoji: '🌅' },
  { id: 'no-shorts-after-21', category: 'detox', requiresApp: 'youtube', emoji: '🌙' },
  { id: 'read-15', category: 'mind', emoji: '📖' },
  { id: 'study-20', category: 'mind', emoji: '🧠' },
  { id: 'steps-10k', category: 'body', emoji: '👟' },
  { id: 'walk-20', category: 'body', emoji: '🌳' },
  { id: 'phone-free-meal', category: 'detox', emoji: '🍝' },
];

export function getChallenge(id: string | null | undefined): Challenge | undefined {
  return CHALLENGES.find((challenge) => challenge.id === id);
}

export function eligibleChallenges(trackedApps: readonly AppId[]): Challenge[] {
  return CHALLENGES.filter(
    (challenge) => !challenge.requiresApp || trackedApps.includes(challenge.requiresApp),
  );
}

/** Deterministic: the same day and app selection always yield the same challenge. */
export function pickDailyChallenge(date: DateKey, trackedApps: readonly AppId[]): Challenge {
  const pool = eligibleChallenges(trackedApps);
  return pool[hashString(date) % pool.length];
}

/** Extra challenges for the (future) Plus plan, shown locked in the free MVP. */
export function extraChallenges(
  date: DateKey,
  trackedApps: readonly AppId[],
  count = 2,
): Challenge[] {
  const daily = pickDailyChallenge(date, trackedApps);
  const rest = eligibleChallenges(trackedApps).filter((challenge) => challenge.id !== daily.id);
  const offset = hashString(`${date}:plus`) % Math.max(rest.length, 1);
  return [...rest.slice(offset), ...rest.slice(0, offset)].slice(0, count);
}
