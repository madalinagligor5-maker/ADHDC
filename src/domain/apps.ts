export const APP_IDS = ['tiktok', 'instagram', 'youtube', 'facebook', 'other'] as const;

export type AppId = (typeof APP_IDS)[number];

/** Minutes per app for one day. A missing key means "no entry", 0 means "explicitly zero". */
export type UsageMap = Partial<Record<AppId, number>>;

export interface AppInfo {
  id: AppId;
  /** Brand name; `null` for "other", whose label comes from translations. */
  name: string | null;
  color: string;
  /**
   * Android package names for the automatic provider. Android reports time per
   * app, so Reels/Shorts cannot be separated from the rest of Instagram/YouTube.
   */
  androidPackages: string[];
}

export const APPS: Record<AppId, AppInfo> = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    color: '#F8FAFC',
    androidPackages: ['com.zhiliaoapp.musically', 'com.ss.android.ugc.trill'],
  },
  instagram: { id: 'instagram', name: 'Instagram', color: '#F472B6', androidPackages: ['com.instagram.android'] },
  youtube: { id: 'youtube', name: 'YouTube', color: '#FB7185', androidPackages: ['com.google.android.youtube'] },
  facebook: { id: 'facebook', name: 'Facebook', color: '#22D3EE', androidPackages: ['com.facebook.katana'] },
  other: { id: 'other', name: null, color: '#94A3B8', androidPackages: [] },
};

export const MAX_DAY_MINUTES = 24 * 60;

export function isAppId(value: unknown): value is AppId {
  return typeof value === 'string' && (APP_IDS as readonly string[]).includes(value);
}

/** Total minutes for a day, or `null` when nothing was recorded. */
export function totalMinutes(usage: UsageMap): number | null {
  const values = APP_IDS.map((id) => usage[id]).filter((value): value is number => value !== undefined);
  return values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0);
}

export function topApps(usage: UsageMap, count = 3) {
  return APP_IDS.map((id) => ({ id, minutes: usage[id] }))
    .filter((entry): entry is { id: AppId; minutes: number } => entry.minutes !== undefined && entry.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, count);
}
