import { Platform } from 'react-native';

import { androidUsageProvider } from './androidUsageProvider';
import { iosUsageProvider } from './iosUsageProvider';
import type { UsageProvider } from './types';

export { demoUsageProvider } from './demoUsageProvider';
export { manualUsageProvider } from './manualUsageProvider';
export * from './types';

const webProvider: UsageProvider = {
  ...iosUsageProvider,
  getAvailability: () => ({ available: false, reason: 'web' }),
};

/** The native provider for this platform. Check `getAvailability()` before offering it. */
export const nativeUsageProvider: UsageProvider = Platform.select({
  android: androidUsageProvider,
  ios: iosUsageProvider,
  default: webProvider,
});
