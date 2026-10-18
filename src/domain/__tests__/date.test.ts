import { describe, expect, it } from '@jest/globals';

import { addDays, dayBounds, lastNDays, toDateKey } from '../date';

// jest.globalSetup.js runs the suite in Europe/Bucharest (DST on 2026-03-29 and 2026-10-25).
describe('local dates', () => {
  it('runs in a DST time zone', () => {
    expect(process.env.TZ).toBe('Europe/Bucharest');
  });

  it('moves across DST changes by calendar days, not 24h blocks', () => {
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
    expect(addDays('2026-10-26', -1)).toBe('2026-10-25');
    expect(lastNDays(3, '2026-03-30')).toEqual(['2026-03-28', '2026-03-29', '2026-03-30']);
  });

  it('has 23- and 25-hour days at the DST boundaries', () => {
    const spring = dayBounds('2026-03-29');
    const autumn = dayBounds('2026-10-25');
    expect((spring.end - spring.start) / 3_600_000).toBe(23);
    expect((autumn.end - autumn.start) / 3_600_000).toBe(25);
  });

  it('uses the local calendar day near midnight', () => {
    expect(toDateKey(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
    expect(toDateKey(new Date(2025, 11, 31, 23, 55))).toBe('2025-12-31');
  });
});
