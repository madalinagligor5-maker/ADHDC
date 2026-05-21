import { useCallback, useEffect, useRef, useState } from 'react';

import { MODE_DURATIONS, type FocusMode, type FocusPhase } from './types';

interface FocusTimerOptions {
  /** Called when a focus phase finishes naturally. */
  onFocusComplete: (info: { mode: FocusMode; durationMinutes: number; startedAt: string }) => void;
}

export interface FocusTimer {
  mode: FocusMode;
  phase: FocusPhase;
  running: boolean;
  remaining: number;
  totalSeconds: number;
  /** 0..1 progress through the current phase. */
  progress: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  switchMode: (mode: FocusMode) => void;
  /** Skip the current break and return to a fresh focus phase. */
  skipBreak: () => void;
}

function phaseSeconds(mode: FocusMode, phase: FocusPhase): number {
  const d = MODE_DURATIONS[mode];
  return (phase === 'focus' ? d.focus : d.break) * 60;
}

export function useFocusTimer({ onFocusComplete }: FocusTimerOptions): FocusTimer {
  const [mode, setMode] = useState<FocusMode>('pomodoro');
  const [phase, setPhase] = useState<FocusPhase>('focus');
  const [running, setRunning] = useState(false);
  const totalSeconds = phaseSeconds(mode, phase);
  const [remaining, setRemaining] = useState(totalSeconds);

  const endRef = useRef(0);
  const startedAtRef = useRef<string | null>(null);
  const completeRef = useRef<() => void>(() => {});

  completeRef.current = () => {
    setRunning(false);
    if (phase === 'focus') {
      const startedAt = startedAtRef.current ?? new Date().toISOString();
      startedAtRef.current = null;
      onFocusComplete({ mode, durationMinutes: MODE_DURATIONS[mode].focus, startedAt });
      setPhase('break');
      setRemaining(phaseSeconds(mode, 'break'));
    } else {
      setPhase('focus');
      setRemaining(phaseSeconds(mode, 'focus'));
    }
  };

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) completeRef.current();
    }, 250);
    return () => clearInterval(iv);
  }, [running]);

  const start = useCallback(() => {
    setRemaining((current) => {
      if (current <= 0) return current;
      endRef.current = Date.now() + current * 1000;
      return current;
    });
    if (phase === 'focus' && startedAtRef.current === null) {
      startedAtRef.current = new Date().toISOString();
    }
    setRunning(true);
  }, [phase]);

  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    setRunning(false);
    startedAtRef.current = null;
    setRemaining(phaseSeconds(mode, phase));
  }, [mode, phase]);

  const switchMode = useCallback((next: FocusMode) => {
    setMode(next);
    setPhase('focus');
    setRunning(false);
    startedAtRef.current = null;
    setRemaining(phaseSeconds(next, 'focus'));
  }, []);

  const skipBreak = useCallback(() => {
    setRunning(false);
    setPhase('focus');
    setRemaining(phaseSeconds(mode, 'focus'));
  }, [mode]);

  const progress = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0;

  return {
    mode,
    phase,
    running,
    remaining,
    totalSeconds,
    progress,
    start,
    pause,
    reset,
    switchMode,
    skipBreak,
  };
}

/** Format seconds as `M:SS` or `MM:SS`. */
export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
}
