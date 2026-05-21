// Bundled translation resources. Each namespace is a separate JSON file per
// language so the app stays offline-first and reviewers can grep for strings.
// Add a namespace by creating the JSON file in all three locales and listing
// it here — nothing else needs to change.

import enCalendar from '@/locales/en/calendar.json';
import enCoach from '@/locales/en/coach.json';
import enCommon from '@/locales/en/common.json';
import enFocus from '@/locales/en/focus.json';
import enHabits from '@/locales/en/habits.json';
import enHome from '@/locales/en/home.json';
import enMood from '@/locales/en/mood.json';
import enMore from '@/locales/en/more.json';
import enNotifications from '@/locales/en/notifications.json';
import enOnboarding from '@/locales/en/onboarding.json';
import enSettings from '@/locales/en/settings.json';
import enStats from '@/locales/en/stats.json';
import enTasks from '@/locales/en/tasks.json';

import roCalendar from '@/locales/ro/calendar.json';
import roCoach from '@/locales/ro/coach.json';
import roCommon from '@/locales/ro/common.json';
import roFocus from '@/locales/ro/focus.json';
import roHabits from '@/locales/ro/habits.json';
import roHome from '@/locales/ro/home.json';
import roMood from '@/locales/ro/mood.json';
import roMore from '@/locales/ro/more.json';
import roNotifications from '@/locales/ro/notifications.json';
import roOnboarding from '@/locales/ro/onboarding.json';
import roSettings from '@/locales/ro/settings.json';
import roStats from '@/locales/ro/stats.json';
import roTasks from '@/locales/ro/tasks.json';

import frCalendar from '@/locales/fr/calendar.json';
import frCoach from '@/locales/fr/coach.json';
import frCommon from '@/locales/fr/common.json';
import frFocus from '@/locales/fr/focus.json';
import frHabits from '@/locales/fr/habits.json';
import frHome from '@/locales/fr/home.json';
import frMood from '@/locales/fr/mood.json';
import frMore from '@/locales/fr/more.json';
import frNotifications from '@/locales/fr/notifications.json';
import frOnboarding from '@/locales/fr/onboarding.json';
import frSettings from '@/locales/fr/settings.json';
import frStats from '@/locales/fr/stats.json';
import frTasks from '@/locales/fr/tasks.json';

export const defaultNS = 'common' as const;

export const resources = {
  en: {
    common: enCommon,
    home: enHome,
    settings: enSettings,
    onboarding: enOnboarding,
    more: enMore,
    tasks: enTasks,
    focus: enFocus,
    habits: enHabits,
    mood: enMood,
    coach: enCoach,
    calendar: enCalendar,
    stats: enStats,
    notifications: enNotifications,
  },
  ro: {
    common: roCommon,
    home: roHome,
    settings: roSettings,
    onboarding: roOnboarding,
    more: roMore,
    tasks: roTasks,
    focus: roFocus,
    habits: roHabits,
    mood: roMood,
    coach: roCoach,
    calendar: roCalendar,
    stats: roStats,
    notifications: roNotifications,
  },
  fr: {
    common: frCommon,
    home: frHome,
    settings: frSettings,
    onboarding: frOnboarding,
    more: frMore,
    tasks: frTasks,
    focus: frFocus,
    habits: frHabits,
    mood: frMood,
    coach: frCoach,
    calendar: frCalendar,
    stats: frStats,
    notifications: frNotifications,
  },
} as const;

export const namespaces = [
  'common',
  'home',
  'settings',
  'onboarding',
  'more',
  'tasks',
  'focus',
  'habits',
  'mood',
  'coach',
  'calendar',
  'stats',
  'notifications',
] as const;
