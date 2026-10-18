export const APP_IDS = ['tiktok', 'instagram', 'youtube', 'snapchat', 'facebook'] as const;

export type AppId = (typeof APP_IDS)[number];

/** Minutes spent per app on a given day. Missing keys mean 0. */
export type UsageMap = Partial<Record<AppId, number>>;

export interface AppInfo {
  id: AppId;
  /** Brand names are not translated. */
  name: string;
  /** Short-form feed this app is known for (shown under the name). */
  feed: string;
  color: string;
  /** Android package names, used by the automatic (UsageStats) provider. */
  androidPackages: string[];
}

export const APPS: Record<AppId, AppInfo> = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    feed: 'For You',
    color: '#FF2D55',
    androidPackages: ['com.zhiliaoapp.musically', 'com.ss.android.ugc.trill'],
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    feed: 'Reels',
    color: '#C13584',
    androidPackages: ['com.instagram.android'],
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    feed: 'Shorts',
    color: '#FF4E45',
    androidPackages: ['com.google.android.youtube'],
  },
  snapchat: {
    id: 'snapchat',
    name: 'Snapchat',
    feed: 'Spotlight',
    color: '#FFFC00',
    androidPackages: ['com.snapchat.android'],
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    feed: 'Reels',
    color: '#1877F2',
    androidPackages: ['com.facebook.katana'],
  },
};

/** Apps offered in onboarding; "all" selects every tracked app. */
export const ONBOARDING_APPS: AppId[] = ['tiktok', 'instagram', 'youtube'];

export function totalMinutes(usage: UsageMap, apps: readonly AppId[]): number {
  return apps.reduce((sum, id) => sum + (usage[id] ?? 0), 0);
}

export function topApps(usage: UsageMap, apps: readonly AppId[], count = 3) {
  return apps
    .map((id) => ({ id, minutes: usage[id] ?? 0 }))
    .filter((entry) => entry.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, count);
}

export function sanitizeMinutes(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(Math.round(value), 24 * 60);
}
