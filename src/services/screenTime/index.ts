import { Platform } from 'react-native';

import { androidProvider } from './androidProvider';
import { iosProvider } from './iosProvider';
import type { ScreenTimeProvider } from './types';

export { manualProvider } from './manualProvider';
export * from './types';

const webProvider: ScreenTimeProvider = {
  ...iosProvider,
  getAvailability: () => ({ available: false, reason: 'web' }),
};

/** The automatic provider for the current platform (may be unavailable). */
export const automaticProvider: ScreenTimeProvider = Platform.select({
  android: androidProvider,
  ios: iosProvider,
  default: webProvider,
});
