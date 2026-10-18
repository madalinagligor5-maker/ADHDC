import { UsageStats } from '../../../modules/usage-stats';

import { APPS, type AppId, type UsageMap } from '@/domain/apps';
import { dayBounds, type DateKey } from '@/domain/date';
import type { UsageProvider } from './types';

/**
 * Android: UsageStatsManager through the local `usage-stats` Expo module.
 * Needs the special "Usage access" permission granted in system settings and a
 * development/production build (the module does not exist in Expo Go).
 * Time is per app: Reels/Shorts cannot be separated from the rest of the app,
 * and "other" apps are not measured.
 */
export const androidUsageProvider: UsageProvider = {
  kind: 'android-usage-stats',

  getAvailability() {
    return UsageStats ? { available: true } : { available: false, reason: 'needs-dev-build' };
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
    const measurable = apps.filter((id) => APPS[id].androidPackages.length > 0);
    const packages = measurable.flatMap((id) => APPS[id].androidPackages);
    const { start, end } = dayBounds(date);
    const byPackage = await UsageStats.getForegroundMinutes(packages, start, end);
    const usage: UsageMap = {};
    for (const id of measurable) {
      usage[id] = APPS[id].androidPackages.reduce((sum, pkg) => sum + (byPackage[pkg] ?? 0), 0);
    }
    return usage;
  },
};
