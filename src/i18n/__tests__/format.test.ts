import { describe, expect, it, jest } from '@jest/globals';

import en from '../en';
import { formatDays, formatDuration, formatPrice } from '../index';
import ro from '../ro';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('formatting', () => {
  it('uses Romanian plural rules for days', () => {
    expect(formatDays(0, ro, 'ro')).toBe('0 zile');
    expect(formatDays(1, ro, 'ro')).toBe('1 zi');
    expect(formatDays(5, ro, 'ro')).toBe('5 zile');
    expect(formatDays(20, ro, 'ro')).toBe('20 de zile');
    expect(formatDays(1, en, 'en')).toBe('1 day');
    expect(formatDays(20, en, 'en')).toBe('20 days');
  });

  it('formats prices for the UI language', () => {
    expect(formatPrice(14.99, 'RON', 'ro')).toBe('14,99 lei');
    expect(formatPrice(89.99, 'RON', 'ro')).toBe('89,99 lei');
    expect(formatPrice(3.99, 'EUR', 'en')).toBe('€3.99');
  });

  it('formats durations', () => {
    expect(formatDuration(45, ro)).toBe('45 min');
    expect(formatDuration(80, ro)).toBe('1 h 20 min');
    expect(formatDuration(120, en)).toBe('2 h');
  });

  it('keeps both translations in the same shape', () => {
    const keys = (value: unknown, prefix = ''): string[] =>
      value && typeof value === 'object' && !Array.isArray(value)
        ? Object.entries(value).flatMap(([key, child]) => keys(child, `${prefix}${key}.`))
        : [prefix];
    expect(keys(en)).toEqual(keys(ro));
  });
});
