import type { AppId, UsageMap } from '@/domain/apps';
import type { DateKey } from '@/domain/date';

export type UnavailableReason = 'ios-entitlement' | 'needs-dev-build' | 'web';

export type ProviderAvailability = { available: true } | { available: false; reason: UnavailableReason };

export type UsagePermission = 'granted' | 'denied' | 'not-required' | 'unavailable';

/**
 * One contract for every usage source. Each returns minutes per app for a day;
 * the store decides how the result is saved (one source per day, manual wins).
 */
export interface UsageProvider {
  readonly kind: 'manual' | 'demo' | 'android-usage-stats' | 'ios-screen-time';
  getAvailability(): ProviderAvailability;
  getPermission(): Promise<UsagePermission>;
  /**
   * Starts the permission flow after an explicit user action. On Android this
   * opens system settings, so the outcome is only known when the app returns.
   */
  requestPermission(): Promise<UsagePermission>;
  getUsage(date: DateKey, apps: readonly AppId[]): Promise<UsageMap>;
}
