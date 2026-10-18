import { currentPlanFrom } from './entitlement';
import { createPreviewService } from './previewService';

export * from './types';
export { currentPlanFrom };

/** Swap for a store-backed implementation when billing is configured. */
export const subscriptionService = createPreviewService('RO');
