import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, ChoiceRow, Screen, StepHeader } from '@/components';
import { PURPOSES, type Purpose } from '@/domain/types';
import { useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

const ICONS: Record<Purpose, 'school-outline' | 'moon-outline' | 'people-outline' | 'construct-outline' | 'leaf-outline'> = {
  learning: 'school-outline',
  rest: 'moon-outline',
  people: 'people-outline',
  projects: 'construct-outline',
  'less-scroll': 'leaf-outline',
};

/** Onboarding 2 — what the user wants more time for. Saved locally right away. */
export default function Goal() {
  const strings = useStrings();
  const s = strings.onboarding;
  const purpose = useAppStore((state) => state.settings.purpose);
  const updateSettings = useAppStore((state) => state.updateSettings);

  return (
    <Screen footer={<Button label={strings.common.continue} disabled={!purpose} onPress={() => router.push('/onboarding/apps')} />}>
      <StepHeader current={1} total={4} />
      <AppText variant="title" accessibilityRole="header">
        {s.goalTitle}
      </AppText>
      <AppText variant="body" color={colors.textMuted}>
        {s.goalSubtitle}
      </AppText>
      <View style={{ gap: spacing.sm }} accessibilityRole="radiogroup">
        {PURPOSES.map((id) => (
          <ChoiceRow
            key={id}
            icon={ICONS[id]}
            title={strings.purposes[id]}
            selected={purpose === id}
            onPress={() => updateSettings({ purpose: id })}
          />
        ))}
      </View>
    </Screen>
  );
}
