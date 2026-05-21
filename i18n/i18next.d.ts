import 'i18next';

import { defaultNS, resources } from './resources';

// Makes t() keys type-safe and autocompleted against the English resources.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}
