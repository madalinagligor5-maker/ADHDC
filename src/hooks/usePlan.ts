import { useEffect, useState } from 'react';

import type { PlanId } from '@/domain/plans';
import { currentPlanFrom, subscriptionService, type Entitlement } from '@/services/subscription';
import { useAppStore } from '@/store/useAppStore';

const NONE: Entitlement = { plus: false, source: 'none' };

export function usePlan(): PlanId {
  const devPlus = useAppStore((state) => state.devPlus);
  const [entitlement, setEntitlement] = useState<Entitlement>(NONE);

  useEffect(() => {
    let active = true;
    subscriptionService
      .getEntitlement()
      .then((result) => active && setEntitlement(result))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return currentPlanFrom(entitlement, devPlus, __DEV__);
}
