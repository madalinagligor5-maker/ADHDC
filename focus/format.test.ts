import { MODE_DURATIONS } from './types';
import { formatClock } from './useFocusTimer';

describe('focus timer helpers', () => {
  test('formatClock pads seconds', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(65)).toBe('1:05');
    expect(formatClock(25 * 60)).toBe('25:00');
  });

  test('mode durations', () => {
    expect(MODE_DURATIONS.pomodoro.focus).toBe(25);
    expect(MODE_DURATIONS.pomodoro.break).toBe(5);
    expect(MODE_DURATIONS.deep.focus).toBe(50);
  });
});
