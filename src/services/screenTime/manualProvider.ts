import { useAppStore } from '@/store/useAppStore';
import type { ScreenTimeProvider } from './types';

/** Manual entry: always available, reads what the user typed in. */
export const manualProvider: ScreenTimeProvider = {
  kind: 'manual',
  getAvailability: () => ({ available: true }),
  getPermission: async () => 'granted',
  requestPermission: async () => 'granted',
  getUsage: async (date, apps) => {
    const usage = useAppStore.getState().days[date]?.usage ?? {};
    return Object.fromEntries(apps.map((id) => [id, usage[id] ?? 0]));
  },
};
