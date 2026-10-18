import type { Currency } from '@/domain/plans';

export type ProductId = 'plus_monthly' | 'plus_annual';

export interface Offering {
  productId: ProductId;
  period: 'month' | 'year';
  price: number;
  currency: Currency;
  /** Optional introductory price for the first period (launch offer). */
  introPrice?: number;
}

export interface Entitlement {
  plus: boolean;
  /** Where the answer came from. Only `store` is trustworthy in production. */
  source: 'store' | 'development' | 'none';
  expiresAt?: number;
}

export type PurchaseResult =
  | { status: 'purchased'; entitlement: Entitlement }
  | { status: 'cancelled' }
  | { status: 'unavailable' };

/**
 * Contract for billing. The real implementation will talk to App Store /
 * Google Play (directly or through a dedicated service) and verify
 * entitlements; the app must never trust a local flag in production.
 */
export interface SubscriptionService {
  /** `false` when no store products are configured (offer preview mode). */
  readonly isConfigured: boolean;
  getOfferings(): Promise<Offering[]>;
  getEntitlement(): Promise<Entitlement>;
  purchase(productId: ProductId): Promise<PurchaseResult>;
  restore(): Promise<Entitlement>;
}
