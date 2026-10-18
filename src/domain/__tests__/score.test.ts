import { describe, expect, it } from '@jest/globals';

import { computeScore, isValidLimit, minutesOverLimit } from '../score';

describe('computeScore', () => {
  it('matches the documented examples', () => {
    expect(computeScore(30, 60)).toBe(100);
    expect(computeScore(60, 60)).toBe(100);
    expect(computeScore(120, 60)).toBe(50);
  });

  it('returns null without data, but 100 for an explicit zero', () => {
    expect(computeScore(null, 60)).toBeNull();
    expect(computeScore(0, 60)).toBe(100);
  });

  it('stays within 0..100 and rounds', () => {
    expect(computeScore(24 * 60, 5)).toBe(0);
    expect(computeScore(90, 60)).toBe(67);
    expect(computeScore(1, 1)).toBe(100);
  });

  it('rejects invalid limits and usage', () => {
    expect(() => computeScore(30, 0)).toThrow(RangeError);
    expect(() => computeScore(30, -10)).toThrow(RangeError);
    expect(() => computeScore(30, Number.NaN)).toThrow(RangeError);
    expect(() => computeScore(-1, 60)).toThrow(RangeError);
    expect(isValidLimit(60)).toBe(true);
    expect(isValidLimit(0)).toBe(false);
  });

  it('reports minutes over the limit', () => {
    expect(minutesOverLimit(75, 60)).toBe(15);
    expect(minutesOverLimit(40, 60)).toBe(0);
  });
});
