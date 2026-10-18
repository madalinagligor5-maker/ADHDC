import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, BrainMark, Button, ProgressRing, Screen } from '@/components';
import { useStrings } from '@/i18n';
import { colors, spacing } from '@/theme';

/** Onboarding 1 — the promise. */
export default function OnboardingPromise() {
  const strings = useStrings();
  const s = strings.onboarding;

  return (
    <Screen
      contentStyle={styles.content}
      footer={
        <>
          <Button label={s.promiseCta} onPress={() => router.push('/onboarding/apps')} />
          <AppText variant="caption" align="center" color={colors.textMuted}>
            {s.promiseFootnote}
          </AppText>
        </>
      }
    >
      <AppText variant="label" color={colors.accent} align="center">
        {strings.common.appName}
      </AppText>
      <View style={styles.visual}>
        <ProgressRing progress={0.62} size={220} color={colors.accent}>
          <BrainMark size={84} />
        </ProgressRing>
        <AppText variant="label" color={colors.textMuted} align="center">
          {`${s.estimatedScore}: ?/100`}
        </AppText>
      </View>
      <AppText variant="hero" align="center" accessibilityRole="header">
        {s.promiseTitle}
      </AppText>
      <AppText variant="body" align="center" color={colors.textMuted}>
        {s.promiseSubtitle}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', gap: spacing.lg },
  visual: { alignItems: 'center', gap: spacing.md },
});
