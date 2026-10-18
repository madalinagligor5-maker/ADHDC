import { LAUNCH_OFFER, PLANNED_PRICES, type PriceRegion } from '@/domain/plans';
import type { Entitlement, Offering, SubscriptionService } from './types';

const NONE: Entitlement = { plus: false, source: 'none' };

/**
 * Offer preview: shows planned prices, never charges and never grants Plus.
 * Used until store products and a billing integration exist.
 */
export function createPreviewService(region: PriceRegion = 'RO'): SubscriptionService {
  const prices = PLANNED_PRICES[region];
  const offerings: Offering[] = [
    {
      productId: 'plus_annual',
      period: 'year',
      price: prices.annual,
      currency: prices.currency,
      introPrice: LAUNCH_OFFER.enabled && LAUNCH_OFFER.region === region ? LAUNCH_OFFER.firstYearAnnual : undefined,
    },
    { productId: 'plus_monthly', period: 'month', price: prices.monthly, currency: prices.currency },
  ];

  return {
    isConfigured: false,
    getOfferings: async () => offerings,
    getEntitlement: async () => NONE,
    purchase: async () => ({ status: 'unavailable' }),
    restore: async () => NONE,
  };
}
