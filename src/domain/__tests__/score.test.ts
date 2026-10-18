import { describe, expect, it } from '@jest/globals';

import { clampScore, computeScore, focusBonus, penaltySlices, scoreTier } from '../score';

const base = { dailyLimitMin: 60, challengeCompleted: false, completedFocus: [] };

describe('penaltySlices', () => {
  it('applies the progressive per-minute rates', () => {
    const total = (minutes: number) => penaltySlices(minutes).reduce((sum, slice) => sum + slice.points, 0);
    expect(total(0)).toBe(0);
    expect(total(30)).toBe(15); // 30 × 0.5
    expect(total(60)).toBe(45); // 15 + 30 × 1
    expect(total(90)).toBe(90); // 45 + 30 × 1.5
  });

  it('treats negative minutes as zero', () => {
    expect(penaltySlices(-10).every((slice) => slice.points === 0)).toBe(true);
  });
});

describe('computeScore', () => {
  it('never exceeds 100', () => {
    expect(computeScore({ ...base, minutes: 0, challengeCompleted: true, completedFocus: [60] }).score).toBe(100);
  });

  it('never goes below 0', () => {
    expect(computeScore({ ...base, minutes: 600 }).score).toBe(0);
  });

  it('adds the limit bonus only when the limit is respected', () => {
    const under = computeScore({ ...base, minutes: 60 });
    expect(under.limitBonus).toBe(15);
    expect(under.score).toBe(70); // 100 − 45 + 15

    const over = computeScore({ ...base, minutes: 61 });
    expect(over.limitBonus).toBe(0);
    expect(over.score).toBe(54); // 100 − 46.5 → 53.5 rounds to 54
  });

  it('adds the challenge bonus', () => {
    const result = computeScore({ ...base, minutes: 120, challengeCompleted: true });
    // 100 − (15 + 30 + 90) + 10
    expect(result.score).toBe(0);
    expect(computeScore({ ...base, minutes: 80, challengeCompleted: true }).score).toBe(35); // 100 − 75 + 10
  });

  it('caps the daily focus bonus', () => {
    expect(focusBonus([15, 30])).toBe(8);
    expect(focusBonus([60, 60, 60])).toBe(20);
  });
});

describe('scoreTier', () => {
  it.each([
    [100, 'clean'],
    [90, 'clean'],
    [89, 'good'],
    [70, 'good'],
    [69, 'moderate'],
    [40, 'moderate'],
    [39, 'high'],
    [10, 'high'],
    [9, 'npc'],
    [0, 'npc'],
  ])('%i → %s', (score, tier) => {
    expect(scoreTier(score)).toBe(tier);
  });

  it('clamps and rounds', () => {
    expect(clampScore(120)).toBe(100);
    expect(clampScore(-3)).toBe(0);
    expect(clampScore(53.5)).toBe(54);
  });
});
