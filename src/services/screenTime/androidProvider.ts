import { UsageStats } from '../../../modules/usage-stats';

import { APPS, type AppId, type UsageMap } from '@/domain/apps';
import { dayBounds, type DateKey } from '@/domain/date';
import type { ScreenTimeProvider } from './types';

/** Android: UsageStatsManager via the local `usage-stats` Expo module. */
export const androidProvider: ScreenTimeProvider = {
  kind: 'android-usage-stats',

  getAvailability() {
    return UsageStats ? { available: true } : { available: false, reason: 'needs-native-build' };
  },

  async getPermission() {
    if (!UsageStats) return 'unavailable';
    return UsageStats.hasPermission() ? 'granted' : 'denied';
  },

  async requestPermission() {
    if (!UsageStats) return 'unavailable';
    if (UsageStats.hasPermission()) return 'granted';
    UsageStats.openUsageAccessSettings();
    return 'denied';
  },

  async getUsage(date: DateKey, apps: readonly AppId[]) {
    if (!UsageStats) throw new Error('Usage stats module is not available');
    const packages = apps.flatMap((id) => APPS[id].androidPackages);
    const { start, end } = dayBounds(date);
    const byPackage = await UsageStats.getForegroundMinutes(packages, start, end);
    const usage: UsageMap = {};
    for (const id of apps) {
      usage[id] = APPS[id].androidPackages.reduce((sum, pkg) => sum + (byPackage[pkg] ?? 0), 0);
    }
    return usage;
  },
};
