import { APPS, type AppId } from '@/domain/apps';
import { fromDateKey, todayKey, addDays, type DateKey } from '@/domain/date';
import type { Currency } from '@/domain/plans';
import type { Language } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';
import en from './en';
import ro, { type Strings } from './ro';

export type { Strings };

export const translations: Record<Language, Strings> = { ro, en };

export const DEFAULT_LANGUAGE: Language = 'ro';

const LOCALES: Record<Language, string> = { ro: 'ro-RO', en: 'en-US' };

export function localeOf(language: Language): string {
  return LOCALES[language];
}

/** Replaces `{name}` placeholders with the given values. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function getStrings(language: Language): Strings {
  return translations[language] ?? translations[DEFAULT_LANGUAGE];
}

/** Strings for the language chosen in Settings. */
export function useStrings(): Strings {
  const language = useAppStore((state) => state.settings.language);
  return getStrings(language);
}

export function useLanguage(): Language {
  return useAppStore((state) => state.settings.language);
}

/** "45 min" / "1 h 20 min". */
export function formatDuration(minutes: number, strings: Strings): string {
  const total = Math.round(minutes);
  if (total < 60) return `${total} ${strings.common.minutesShort}`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const h = `${hours} ${strings.common.hoursShort}`;
  return rest === 0 ? h : `${h} ${rest} ${strings.common.minutesShort}`;
}

/** Romanian plural rules: 1 zi · 2–19 zile · 20+ de zile (and 0 zile). */
export function formatDays(n: number, strings: Strings, language: Language): string {
  if (n === 1) return format(strings.common.dayOne, { n });
  if (language === 'ro') {
    const lastTwo = n % 100;
    if (n !== 0 && (lastTwo === 0 || lastTwo >= 20)) return format(strings.common.dayMany, { n });
  }
  return format(strings.common.dayFew, { n });
}

/** Currency formatted for the UI language; the currency itself comes from the price region. */
export function formatPrice(amount: number, currency: Currency, language: Language): string {
  if (currency === 'RON' && language === 'ro') {
    // Intl renders "RON"; Romanian copy uses "lei".
    return `${new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} lei`;
  }
  return new Intl.NumberFormat(localeOf(language), { style: 'currency', currency }).format(amount);
}

export function formatNumber(value: number, language: Language): string {
  return new Intl.NumberFormat(localeOf(language)).format(value);
}

/** "Azi", "Ieri", or e.g. "joi, 16 oct.". */
export function formatDay(date: DateKey, strings: Strings, language: Language, today: DateKey = todayKey()): string {
  if (date === today) return strings.common.today;
  if (date === addDays(today, -1)) return strings.common.yesterday;
  return fromDateKey(date).toLocaleDateString(localeOf(language), { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Short weekday for chart labels ("lun.", "Mon"). */
export function formatWeekday(date: DateKey, language: Language): string {
  return fromDateKey(date).toLocaleDateString(localeOf(language), { weekday: 'short' });
}

export function appName(id: AppId, strings: Strings): string {
  return APPS[id].name ?? strings.apps.other;
}
