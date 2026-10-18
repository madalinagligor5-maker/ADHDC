import { requireOptionalNativeModule } from 'expo';

interface UsageStatsNativeModule {
  hasPermission(): boolean;
  openUsageAccessSettings(): void;
  getForegroundMinutes(
    packages: string[],
    startMs: number,
    endMs: number,
  ): Promise<Record<string, number>>;
}

/**
 * The native module only exists in Android development/production builds.
 * In Expo Go, on iOS and on web this is `null` and the app falls back to
 * manual entry.
 */
export const UsageStats = requireOptionalNativeModule<UsageStatsNativeModule>('ScrollFadeUsageStats');
