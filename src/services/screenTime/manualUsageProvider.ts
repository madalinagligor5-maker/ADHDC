import { useAppStore } from '@/store/useAppStore';
import type { UsageProvider } from './types';

/** Self-reported minutes typed in by the user. Always available, no permission. */
export const manualUsageProvider: UsageProvider = {
  kind: 'manual',
  getAvailability: () => ({ available: true }),
  getPermission: async () => 'not-required',
  requestPermission: async () => 'not-required',
  getUsage: async (date, apps) => {
    const usage = useAppStore.getState().days[date]?.usage ?? {};
    return Object.fromEntries(apps.filter((id) => usage[id] !== undefined).map((id) => [id, usage[id]]));
  },
};
