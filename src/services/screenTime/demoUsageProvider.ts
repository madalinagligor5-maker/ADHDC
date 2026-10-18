import { buildDemoDays } from '@/domain/demo';
import type { UsageProvider } from './types';

/** Fixed sample data for the labelled demo mode. */
export const demoUsageProvider: UsageProvider = {
  kind: 'demo',
  getAvailability: () => ({ available: true }),
  getPermission: async () => 'not-required',
  requestPermission: async () => 'not-required',
  getUsage: async (date, apps) => {
    const usage = buildDemoDays(date)[date]?.usage ?? {};
    return Object.fromEntries(apps.filter((id) => usage[id] !== undefined).map((id) => [id, usage[id]]));
  },
};
