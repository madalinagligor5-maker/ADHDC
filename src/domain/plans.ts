export type PlanId = 'free' | 'plus';

export type Feature = 'extendedHistory' | 'weeklyReport' | 'challengeLibrary';

/** Plus benefits that actually work in this build. */
export const PLUS_FEATURES: Feature[] = ['extendedHistory', 'weeklyReport', 'challengeLibrary'];

/** Shown separately and labelled as planned, never as active benefits. */
export const PLANNED_FEATURES = ['customPrograms', 'autoMonitoring', 'scheduledBlocking'] as const;

export const HISTORY_DAYS: Record<PlanId, number> = { free: 7, plus: 90 };

export function canUse(plan: PlanId, feature: Feature): boolean {
  return plan === 'plus' && PLUS_FEATURES.includes(feature);
}

export type Currency = 'RON' | 'EUR' | 'USD';
export type PriceRegion = 'RO' | 'EU' | 'US';

export interface RegionPrices {
  currency: Currency;
  monthly: number;
  annual: number;
}

/**
 * Planned prices. In production the store provides localized prices; these are
 * only used for the offer preview. Region is never derived from the UI language.
 */
export const PLANNED_PRICES: Record<PriceRegion, RegionPrices> = {
  RO: { currency: 'RON', monthly: 14.99, annual: 89.99 },
  EU: { currency: 'EUR', monthly: 3.99, annual: 19.99 },
  US: { currency: 'USD', monthly: 3.99, annual: 19.99 },
};

/** Optional launch offer: first 12 months at a lower annual price. Off by default. */
export const LAUNCH_OFFER = { enabled: false, region: 'RO' as PriceRegion, firstYearAnnual: 59.99 };

export function monthlyEquivalent(prices: RegionPrices): number {
  return Math.round((prices.annual / 12) * 100) / 100;
}

/** Savings of the annual plan versus 12 monthly payments, as a whole percent. */
export function annualSavingsPercent(prices: RegionPrices): number {
  return Math.round((1 - prices.annual / (prices.monthly * 12)) * 100);
}
