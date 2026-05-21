import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import i18n from '@/i18n';
import { useHabitsStore } from '@/store/habitsStore';
import { useSettingsStore } from '@/store/settingsStore';

/** Foreground display behavior — calm: show, no aggressive sound by default. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

function parseTime(hhmm: string): { hour: number; minute: number } {
  const [h, m] = hhmm.split(':').map(Number);
  return { hour: h ?? 8, minute: m ?? 0 };
}

function dailyTrigger(hhmm: string): Notifications.NotificationTriggerInput {
  const { hour, minute } = parseTime(hhmm);
  return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute };
}

/**
 * Cancels and re-schedules all local reminders from current settings + habits.
 * Friendly and fatigue-aware: only what the user enabled, nothing imperative.
 */
export async function syncReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  const { reminders } = useSettingsStore.getState();
  if (!reminders.enabled) return;
  if (!(await ensureNotificationPermission())) return;

  const t = i18n.t;

  if (reminders.morningSummary) {
    await Notifications.scheduleNotificationAsync({
      content: { title: t('notifications:morning.title'), body: t('notifications:morning.body') },
      trigger: dailyTrigger(reminders.morningTime),
    });
  }

  if (reminders.eveningSummary) {
    await Notifications.scheduleNotificationAsync({
      content: { title: t('notifications:evening.title'), body: t('notifications:evening.body') },
      trigger: dailyTrigger(reminders.eveningTime),
    });
  }

  if (reminders.gentleNudges) {
    const { habits } = useHabitsStore.getState();
    for (const habit of habits) {
      if (!habit.reminderTime) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications:habit.title'),
          body: t('notifications:habit.body', { name: habit.name }),
        },
        trigger: dailyTrigger(habit.reminderTime),
      });
    }
  }
}
