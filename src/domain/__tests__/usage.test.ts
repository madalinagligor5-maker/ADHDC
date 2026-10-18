import { describe, expect, it } from '@jest/globals';

import { totalMinutes } from '../apps';
import { maxMinutesFor, normalizeAutoUsage, toMinutes, validateEntry } from '../usage';

describe('validateEntry', () => {
  it('rejects negative and non-integer values', () => {
    expect(validateEntry({}, 'tiktok', -5)).toBe('negative');
    expect(validateEntry({}, 'tiktok', 1.5)).toBe('invalid');
    expect(validateEntry({}, 'tiktok', Number.NaN)).toBe('invalid');
  });

  it('caps the day at 24 hours', () => {
    expect(validateEntry({ instagram: 1000 }, 'tiktok', 440)).toBeNull();
    expect(validateEntry({ instagram: 1000 }, 'tiktok', 441)).toBe('over-day');
    expect(maxMinutesFor({ instagram: 1000 }, 'tiktok')).toBe(440);
  });

  it('ignores the previous value of the same app (re-entry replaces it)', () => {
    expect(validateEntry({ tiktok: 1400 }, 'tiktok', 1440)).toBeNull();
  });

  it('accepts an explicit zero', () => {
    expect(validateEntry({}, 'youtube', 0)).toBeNull();
  });
});

describe('totals', () => {
  it('distinguishes no data from zero minutes', () => {
    expect(totalMinutes({})).toBeNull();
    expect(totalMinutes({ tiktok: 0 })).toBe(0);
    expect(totalMinutes({ tiktok: 20, other: 5 })).toBe(25);
  });

  it('converts hours and minutes', () => {
    expect(toMinutes(1, 30)).toBe(90);
  });

  it('normalizes automatic readings into a valid day', () => {
    expect(normalizeAutoUsage({ tiktok: 12.6, instagram: -3 })).toEqual({ tiktok: 13, instagram: 0 });
    const huge = normalizeAutoUsage({ tiktok: 1000, instagram: 1000 });
    expect(totalMinutes(huge)).toBe(1440);
  });
});
