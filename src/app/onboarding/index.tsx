import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, LogoMark, ScoreRing, Screen } from '@/components';
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
          <Button tone="cyan" label={s.promiseCta} onPress={() => router.push('/onboarding/apps')} />
          <Button variant="ghost" label={s.exploreExample} onPress={() => router.push('/score?example=1')} />
          <AppText variant="caption" align="center" color={colors.textMuted}>
            {s.promiseFootnote}
          </AppText>
        </>
      }
    >
      <View style={styles.center}>
        <LogoMark size={56} />
      </View>
      <AppText variant="hero" align="center" accessibilityRole="header">
        {s.promiseTitle}
      </AppText>
      <AppText variant="body" align="center" color={colors.textMuted}>
        {s.promiseSubtitle}
      </AppText>
      <View style={[styles.center, styles.ring]}>
        <ScoreRing score={null} label={strings.dashboard.scoreLabel} size={210} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', gap: spacing.md },
  center: { alignItems: 'center' },
  ring: { marginTop: spacing.lg },
});
