import { describe, expect, it } from '@jest/globals';

import { elapsedMs, endPause, holdPause, isFinished, remainingMs, resumePause, startPause } from '../pause';

const T0 = 1_760_000_000_000;
const MIN = 60_000;

describe('pause timer', () => {
  it('is based on timestamps, so time in the background still counts', () => {
    const pause = startPause(20, T0);
    // App backgrounded for 12 minutes without any ticks.
    expect(remainingMs(pause, T0 + 12 * MIN)).toBe(8 * MIN);
    // Reopened after the end: finished, never negative.
    expect(isFinished(pause, T0 + 25 * MIN)).toBe(true);
    expect(remainingMs(pause, T0 + 25 * MIN)).toBe(0);
  });

  it('does not count time while on hold', () => {
    let pause = startPause(15, T0);
    pause = holdPause(pause, T0 + 5 * MIN);
    expect(elapsedMs(pause, T0 + 30 * MIN)).toBe(5 * MIN);
    pause = resumePause(pause, T0 + 30 * MIN);
    expect(elapsedMs(pause, T0 + 32 * MIN)).toBe(7 * MIN);
  });

  it('records completed and early-ended sessions', () => {
    const pause = startPause(30, T0);
    expect(endPause(pause, T0 + 30 * MIN).completed).toBe(true);
    const early = endPause(pause, T0 + 10 * MIN);
    expect(early.completed).toBe(false);
    expect(early.elapsedMs).toBe(10 * MIN);
  });
});
