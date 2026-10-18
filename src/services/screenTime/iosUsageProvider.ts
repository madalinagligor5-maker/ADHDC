import type { UsageProvider } from './types';

/**
 * iOS: usage data lives behind FamilyControls / DeviceActivity, which need the
 * Family Controls entitlement approved by Apple and app extensions. Apple only
 * exposes the data inside a DeviceActivityReport extension (not to JavaScript)
 * and threshold events to a DeviceActivityMonitor extension. Not implemented:
 * the provider reports itself unavailable and the app stays in manual mode.
 */
export const iosUsageProvider: UsageProvider = {
  kind: 'ios-screen-time',
  getAvailability: () => ({ available: false, reason: 'ios-entitlement' }),
  getPermission: async () => 'unavailable',
  requestPermission: async () => 'unavailable',
  getUsage: async () => {
    throw new Error('Screen Time integration is not implemented in this build');
  },
};
