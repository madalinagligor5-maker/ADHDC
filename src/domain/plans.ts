export type PlanId = 'free' | 'plus';

export interface PlanLimits {
  /** How many days of history are visible. `null` means unlimited. */
  historyDays: number | null;
  dailyChallenges: number;
  advancedFocus: boolean;
  scheduledBlocks: boolean;
  detailedStats: boolean;
}

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    historyDays: 7,
    dailyChallenges: 1,
    advancedFocus: false,
    scheduledBlocks: false,
    detailedStats: false,
  },
  plus: {
    historyDays: null,
    dailyChallenges: 3,
    advancedFocus: true,
    scheduledBlocks: true,
    detailedStats: true,
  },
};

/**
 * Payments are not part of the MVP: everyone is on the free plan. When billing
 * lands, resolve the plan from the store receipt here.
 */
export function currentPlan(): PlanId {
  return 'free';
}
