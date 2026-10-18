import Constants from 'expo-constants';
import { Platform, Share } from 'react-native';

import { useAppStore } from '@/store/useAppStore';

/** Everything the user has stored, as readable JSON. Demo data is never included. */
export function buildExport(now: Date = new Date()): string {
  const { settings, days, pauses } = useAppStore.getState();
  return JSON.stringify(
    {
      app: 'ScrollFade',
      appVersion: Constants.expoConfig?.version ?? null,
      exportedAt: now.toISOString(),
      settings,
      days: Object.values(days).sort((a, b) => a.date.localeCompare(b.date)),
      pauses,
    },
    null,
    2,
  );
}

/** Opens the system share sheet (native) or downloads a file (web). Resolves when handed off. */
export async function exportData(): Promise<void> {
  const json = buildExport();
  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scrollfade-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: 'ScrollFade', message: json });
}
