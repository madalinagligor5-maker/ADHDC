import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { todayKey } from '@/domain/date';
import { nativeUsageProvider, type UsagePermission } from '@/services/screenTime';
import { useAppStore } from '@/store/useAppStore';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'skipped-manual';

/**
 * In automatic mode with access granted, reads today's usage from the native
 * provider. Runs on mount and whenever the app returns to the foreground.
 * Days with manual entries are never overwritten (one source per day).
 */
export function useScreenTimeSync() {
  const mode = useAppStore((state) => state.settings.screenTimeMode);
  const demo = useAppStore((state) => state.demo);
  const trackedApps = useAppStore((state) => state.settings.trackedApps);
  const applyAutoUsage = useAppStore((state) => state.applyAutoUsage);
  const [permission, setPermission] = useState<UsagePermission | null>(null);
  const [status, setStatus] = useState<SyncStatus>('idle');

  const sync = useCallback(async () => {
    const current = await nativeUsageProvider.getPermission().catch((): UsagePermission => 'unavailable');
    setPermission(current);
    if (demo || mode !== 'auto' || current !== 'granted') return;

    setStatus('syncing');
    try {
      const date = todayKey();
      const usage = await nativeUsageProvider.getUsage(date, trackedApps);
      setStatus(applyAutoUsage(date, usage) ? 'idle' : 'skipped-manual');
    } catch {
      setStatus('error');
    }
  }, [demo, mode, trackedApps, applyAutoUsage]);

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
