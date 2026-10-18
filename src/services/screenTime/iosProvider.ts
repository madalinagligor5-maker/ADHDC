import type { ScreenTimeProvider } from './types';

/**
 * iOS: Screen Time data is only reachable through FamilyControls +
 * DeviceActivity, which need the `com.apple.developer.family-controls`
 * entitlement (approved by Apple) and a DeviceActivityReport extension.
 * Apple never exposes raw minutes to the host app, so the MVP keeps this
 * provider unavailable and the app runs in manual mode. See README.
 */
export const iosProvider: ScreenTimeProvider = {
  kind: 'ios-screen-time',
  getAvailability: () => ({ available: false, reason: 'ios' }),
  getPermission: async () => 'unavailable',
  requestPermission: async () => 'unavailable',
  getUsage: async () => {
    throw new Error('Screen Time integration is not enabled in this build');
  },
};
