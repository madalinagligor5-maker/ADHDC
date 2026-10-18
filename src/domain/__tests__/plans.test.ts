import { describe, expect, it } from '@jest/globals';

import { currentPlanFrom } from '../../services/subscription/entitlement';
import { createPreviewService } from '../../services/subscription/previewService';
import { annualSavingsPercent, canUse, HISTORY_DAYS, LAUNCH_OFFER, monthlyEquivalent, PLANNED_PRICES } from '../plans';

describe('pricing', () => {
  it('derives the advertised Romanian annual figures', () => {
    expect(monthlyEquivalent(PLANNED_PRICES.RO)).toBe(7.5);
    expect(annualSavingsPercent(PLANNED_PRICES.RO)).toBe(50);
  });

  it('keeps the launch offer disabled by default', () => {
    expect(LAUNCH_OFFER.enabled).toBe(false);
  });
});

describe('Free vs Plus', () => {
  it('limits history and Plus features on the free plan', () => {
    expect(HISTORY_DAYS.free).toBe(7);
    expect(canUse('free', 'weeklyReport')).toBe(false);
    expect(canUse('plus', 'weeklyReport')).toBe(true);
  });

  it('only trusts store entitlements in production', () => {
    const none = { plus: false, source: 'none' as const };
    expect(currentPlanFrom(none, true, false)).toBe('free');
    expect(currentPlanFrom(none, true, true)).toBe('plus');
    expect(currentPlanFrom({ plus: true, source: 'store' }, false, false)).toBe('plus');
    expect(currentPlanFrom({ plus: true, source: 'development' }, false, false)).toBe('free');
  });

  it('never grants Plus in offer preview mode', async () => {
    const service = createPreviewService('RO');
    expect(service.isConfigured).toBe(false);
    expect(await service.purchase('plus_annual')).toEqual({ status: 'unavailable' });
    expect((await service.restore()).plus).toBe(false);
  });
});
