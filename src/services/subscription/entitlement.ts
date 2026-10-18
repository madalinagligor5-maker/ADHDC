import type { PlanId } from '@/domain/plans';
import type { Entitlement } from './types';

/**
 * Resolves the plan. The development override only works in dev builds
 * (`__DEV__` is false in production bundles), so a local flag can never
 * unlock Plus for real users.
 */
export function currentPlanFrom(entitlement: Entitlement, devOverride: boolean, isDev: boolean): PlanId {
  if (entitlement.plus && entitlement.source === 'store') return 'plus';
  if (isDev && devOverride) return 'plus';
  return 'free';
}
