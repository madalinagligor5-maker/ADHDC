import { useAppStore } from '@/store/useAppStore';
import { formatMinutes } from '@/domain/date';
import type { Language } from '@/domain/types';
import en from './en';
import ro, { type Strings } from './ro';

export type { Strings };

export const translations: Record<Language, Strings> = { ro, en };

export const DEFAULT_LANGUAGE: Language = 'ro';

/** Replaces `{name}` placeholders with the given values. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** "45 min" / "1 h 20 min", in the current language. */
export function formatDuration(minutes: number, strings: Strings): string {
  return formatMinutes(minutes, { h: strings.common.hoursShort, min: strings.common.minutesShort });
}

export function getStrings(language: Language): Strings {
  return translations[language] ?? translations[DEFAULT_LANGUAGE];
}

/** Strings for the language currently chosen in Settings. */
export function useStrings(): Strings {
  const language = useAppStore((state) => state.settings.language);
  return getStrings(language);
}
