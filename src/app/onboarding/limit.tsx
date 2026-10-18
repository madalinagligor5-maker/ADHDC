import { router } from 'expo-router';
import { useState } from 'react';

import { AppText, Button, LimitPicker, Screen, StepHeader } from '@/components';
import { useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

/** Onboarding 4 — personal daily limit. */
export default function Limit() {
  const strings = useStrings();
  const s = strings.onboarding;
  const saved = useAppStore((state) => state.settings.dailyLimitMin);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [limit, setLimit] = useState<number | null>(saved);

  const next = () => {
    if (limit === null) return;
    updateSettings({ dailyLimitMin: limit });
    router.push('/onboarding/source');
  };

  return (
    <Screen footer={<Button label={strings.common.continue} disabled={limit === null} onPress={next} />}>
      <StepHeader current={3} total={4} />
      <AppText variant="title" accessibilityRole="header">
        {s.limitTitle}
      </AppText>
      <AppText variant="body" color={colors.textMuted}>
        {s.limitSubtitle}
      </AppText>
      <LimitPicker value={saved} onChange={setLimit} />
    </Screen>
  );
}
