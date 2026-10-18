import type { FocusDuration } from './types';

/**
 * Provisional Fade Score rules. Everything that tunes the score lives here so
 * it can be adjusted without touching the UI.
 */
export const SCORE_RULES = {
  start: 100,
  /** Penalty per minute, applied progressively (like tax brackets). */
  penaltyTiers: [
    { fromMin: 0, toMin: 30, rate: 0.5 },
    { fromMin: 30, toMin: 60, rate: 1 },
    { fromMin: 60, toMin: Number.POSITIVE_INFINITY, rate: 1.5 },
  ],
  challengeBonus: 10,
  limitBonus: 15,
  focusBonus: { 15: 3, 30: 5, 45: 8, 60: 10 } satisfies Record<FocusDuration, number>,
  maxFocusBonusPerDay: 20,
} as const;

export type ScoreTier = 'clean' | 'good' | 'moderate' | 'high' | 'npc';

export interface PenaltySlice {
  fromMin: number;
  toMin: number;
  rate: number;
  minutes: number;
  points: number;
}

export interface ScoreInput {
  /** Minutes spent today in the tracked apps. */
  minutes: number;
  dailyLimitMin: number;
  challengeCompleted: boolean;
  /** Durations of the focus sessions completed that day. */
  completedFocus: FocusDuration[];
}

export interface ScoreBreakdown {
  start: number;
  penalty: number;
  slices: PenaltySlice[];
  challengeBonus: number;
  limitBonus: number;
  focusBonus: number;
  /** Score before clamping, useful for the detail screen. */
  raw: number;
  score: number;
  tier: ScoreTier;
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function penaltySlices(minutes: number): PenaltySlice[] {
  const safeMinutes = Math.max(0, minutes);
  return SCORE_RULES.penaltyTiers.map(({ fromMin, toMin, rate }) => {
    const inTier = Math.max(0, Math.min(safeMinutes, toMin) - fromMin);
    return { fromMin, toMin, rate, minutes: inTier, points: inTier * rate };
  });
}

export function focusBonus(completed: FocusDuration[]): number {
  const total = completed.reduce((sum, duration) => sum + SCORE_RULES.focusBonus[duration], 0);
  return Math.min(total, SCORE_RULES.maxFocusBonusPerDay);
}

export function scoreTier(score: number): ScoreTier {
  if (score >= 90) return 'clean';
  if (score >= 70) return 'good';
  if (score >= 40) return 'moderate';
  if (score >= 10) return 'high';
  return 'npc';
}

export function computeScore(input: ScoreInput): ScoreBreakdown {
  const slices = penaltySlices(input.minutes);
  const penalty = slices.reduce((sum, slice) => sum + slice.points, 0);
  const challengeBonus = input.challengeCompleted ? SCORE_RULES.challengeBonus : 0;
  const limitBonus = input.minutes <= input.dailyLimitMin ? SCORE_RULES.limitBonus : 0;
  const focus = focusBonus(input.completedFocus);
  const raw = SCORE_RULES.start - penalty + challengeBonus + limitBonus + focus;
  const score = clampScore(raw);
  return {
    start: SCORE_RULES.start,
    penalty,
    slices,
    challengeBonus,
    limitBonus,
    focusBonus: focus,
    raw,
    score,
    tier: scoreTier(score),
  };
}
