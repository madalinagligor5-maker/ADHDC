import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { todayKey } from '@/domain/date';
import { automaticProvider, type ScreenTimePermission } from '@/services/screenTime';
import { useAppStore } from '@/store/useAppStore';

export type SyncStatus = 'idle' | 'syncing' | 'error';

/**
 * Pulls today's usage from the automatic provider when the user chose
 * automatic mode and granted access. Re-checks whenever the app returns to
 * the foreground (e.g. after granting access in Android settings).
 * Manually entered days are never overwritten.
 */
export function useScreenTimeSync() {
  const mode = useAppStore((state) => state.settings.screenTimeMode);
  const trackedApps = useAppStore((state) => state.settings.trackedApps);
  const setUsage = useAppStore((state) => state.setUsage);
  const [permission, setPermission] = useState<ScreenTimePermission | null>(null);
  const [status, setStatus] = useState<SyncStatus>('idle');

  const sync = useCallback(async () => {
    let current: ScreenTimePermission;
    try {
      current = await automaticProvider.getPermission();
    } catch {
      current = 'unavailable';
    }
    setPermission(current);
    if (mode !== 'auto' || current !== 'granted') return;

    const date = todayKey();
    const day = useAppStore.getState().days[date];
    if (day?.hasUsage && day.source === 'manual') return;

    setStatus('syncing');
    try {
      const usage = await automaticProvider.getUsage(date, trackedApps);
      setUsage(date, usage, 'auto');
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }, [mode, trackedApps, setUsage]);

  useEffect(() => {
    const initial = setTimeout(sync, 0);
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') sync();
    });
    return () => {
      clearTimeout(initial);
      subscription.remove();
    };
  }, [sync]);

  return { permission, status, sync };
}
