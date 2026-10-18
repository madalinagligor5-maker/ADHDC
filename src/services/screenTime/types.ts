import type { AppId, UsageMap } from '@/domain/apps';
import type { DateKey } from '@/domain/date';

export type UnavailableReason = 'ios' | 'needs-native-build' | 'web';

export type ScreenTimeAvailability =
  | { available: true }
  | { available: false; reason: UnavailableReason };

export type ScreenTimePermission = 'granted' | 'denied' | 'unavailable';

/**
 * Single data contract shared by every usage source. Manual entry and the
 * automatic platform integrations all produce a `UsageMap` (minutes per app)
 * for a given day, which the store saves and the score is computed from.
 */
export interface ScreenTimeProvider {
  readonly kind: 'android-usage-stats' | 'ios-screen-time' | 'manual';
  getAvailability(): ScreenTimeAvailability;
  getPermission(): Promise<ScreenTimePermission>;
  /**
   * Starts the permission flow. On Android this opens system settings, so the
   * result is only known once the app returns to the foreground.
   */
  requestPermission(): Promise<ScreenTimePermission>;
  getUsage(date: DateKey, apps: readonly AppId[]): Promise<UsageMap>;
}
