import i18n from 'i18next';
import { getLocales } from 'expo-localization';
import { initReactI18next } from 'react-i18next';

import { defaultNS, namespaces, resources } from './resources';

export const SUPPORTED_LANGUAGES = ['en', 'ro', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const FALLBACK_LANGUAGE: SupportedLanguage = 'en';

export function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

/** Best-effort device language, narrowed to a language we actually ship. */
export function resolveDeviceLanguage(): SupportedLanguage {
  const locales = getLocales();
  for (const locale of locales) {
    if (isSupportedLanguage(locale.languageCode)) {
      return locale.languageCode;
    }
  }
  return FALLBACK_LANGUAGE;
}

// Initialize synchronously: all resources are bundled, so there is no async
// load. The effective language is applied later once persisted settings hydrate.
if (!i18n.isInitialized) {
  // eslint-disable-next-line import/no-named-as-default-member
  void i18n.use(initReactI18next).init({
    resources,
    lng: FALLBACK_LANGUAGE,
    fallbackLng: FALLBACK_LANGUAGE,
    defaultNS,
    ns: [...namespaces],
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export default i18n;
