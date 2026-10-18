import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, LogoMark, ScoreRing, Screen } from '@/components';
import { useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing } from '@/theme';

/** Onboarding 1 — welcome. */
export default function Welcome() {
  const strings = useStrings();
  const s = strings.onboarding;
  const enterDemo = useAppStore((state) => state.enterDemo);

  const explore = () => {
    enterDemo();
    router.replace('/');
  };

  return (
    <Screen
      contentStyle={styles.content}
      footer={
        <>
          <Button label={s.welcomeCta} onPress={() => router.push('/onboarding/goal')} />
          <Button variant="ghost" label={s.explore} onPress={explore} />
          <AppText variant="caption" align="center" color={colors.textMuted}>
            {s.welcomeFootnote}
          </AppText>
        </>
      }
    >
      <View style={styles.center}>
        <LogoMark size={44} />
      </View>
      <AppText variant="hero" align="center" accessibilityRole="header">
        {s.welcomeTitle}
      </AppText>
      <AppText variant="body" align="center" color={colors.textMuted}>
        {s.welcomeSubtitle}
      </AppText>
      <View style={[styles.center, styles.ring]}>
        <ScoreRing score={null} label={strings.dashboard.scoreLabel} size={200} />
      </View>
      <AppText variant="caption" align="center" color={colors.textFaint}>
        {s.brainrotNote}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', gap: spacing.md },
  center: { alignItems: 'center' },
  ring: { marginVertical: spacing.md },
});
