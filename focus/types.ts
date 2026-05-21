export type FocusMode = 'pomodoro' | 'deep';
export type FocusPhase = 'focus' | 'break';

export interface FocusSession {
  id: string;
  mode: FocusMode;
  durationMinutes: number;
  completed: boolean;
  startedAt: string;
  endedAt: string;
}

export interface NewFocusSession {
  mode: FocusMode;
  durationMinutes: number;
  completed: boolean;
  startedAt: string;
}

/** Focus/break lengths (minutes) per mode. */
export const MODE_DURATIONS: Record<FocusMode, { focus: number; break: number }> = {
  pomodoro: { focus: 25, break: 5 },
  deep: { focus: 50, break: 10 },
};
