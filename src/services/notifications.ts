import * as Notifications from 'expo-notifications';

import type { Strings } from '@/i18n';

const REMINDER_ID = 'scrollfade-daily-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Local-only daily reminder. Returns false if the user blocked notifications. */
export async function enableDailyReminder(strings: Strings): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.granted ? existing : await Notifications.requestPermissionsAsync();
  if (!permission.granted) return false;

  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => undefined);
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: strings.notifications.reminderTitle,
      body: strings.notifications.reminderBody,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 30,
    },
  });
  return true;
}

export async function disableDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => undefined);
}
