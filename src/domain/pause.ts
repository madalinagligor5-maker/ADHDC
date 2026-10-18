export const PAUSE_DURATIONS = [15, 20, 30, 45, 60] as const;

export type PauseDuration = (typeof PAUSE_DURATIONS)[number];

/**
 * A running or paused break. Time is derived from timestamps, never from
 * counting interval ticks, so it stays correct after the app was in the
 * background or closed.
 */
export interface ActivePause {
  id: string;
  plannedMin: PauseDuration;
  startedAt: number;
  /** Milliseconds counted before the current run segment. */
  accumulatedMs: number;
  /** Start of the current run segment; `null` while paused. */
  runningSince: number | null;
}

export interface PauseSession {
  id: string;
  startedAt: number;
  endedAt: number;
  plannedMin: PauseDuration;
  elapsedMs: number;
  /** True only when the full planned duration elapsed. */
  completed: boolean;
}

export function startPause(plannedMin: PauseDuration, now: number): ActivePause {
  return { id: `p-${now}`, plannedMin, startedAt: now, accumulatedMs: 0, runningSince: now };
}

export function plannedMs(pause: ActivePause): number {
  return pause.plannedMin * 60_000;
}

export function elapsedMs(pause: ActivePause, now: number): number {
  const running = pause.runningSince === null ? 0 : Math.max(0, now - pause.runningSince);
  return Math.min(plannedMs(pause), pause.accumulatedMs + running);
}

export function remainingMs(pause: ActivePause, now: number): number {
  return plannedMs(pause) - elapsedMs(pause, now);
}

export function isFinished(pause: ActivePause, now: number): boolean {
  return remainingMs(pause, now) <= 0;
}

export function holdPause(pause: ActivePause, now: number): ActivePause {
  if (pause.runningSince === null) return pause;
  return { ...pause, accumulatedMs: elapsedMs(pause, now), runningSince: null };
}

export function resumePause(pause: ActivePause, now: number): ActivePause {
  return pause.runningSince === null ? { ...pause, runningSince: now } : pause;
}

export function endPause(pause: ActivePause, now: number): PauseSession {
  const elapsed = elapsedMs(pause, now);
  return {
    id: pause.id,
    startedAt: pause.startedAt,
    endedAt: now,
    plannedMin: pause.plannedMin,
    elapsedMs: elapsed,
    completed: elapsed >= plannedMs(pause),
  };
}
