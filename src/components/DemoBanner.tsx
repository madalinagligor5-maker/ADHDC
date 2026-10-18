import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useStrings } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

/** Permanent label on every screen while demo data is shown. `detailed` adds the explanation. */
export function DemoBanner({ detailed = false }: { detailed?: boolean }) {
  const strings = useStrings();
  const demo = useAppStore((state) => state.demo);
  const onboarded = useAppStore((state) => state.onboarded);
  const exitDemo = useAppStore((state) => state.exitDemo);
  if (!demo) return null;

  const exit = () => {
    exitDemo();
    router.replace(onboarded ? '/' : '/onboarding');
  };

  return (
    <View style={styles.banner} accessibilityRole="summary">
      <View style={styles.dot} />
      <View style={styles.text}>
        <AppText variant="label">{strings.demo.label}</AppText>
        {detailed ? (
          <AppText variant="caption" color={colors.textMuted}>
            {strings.demo.body}
          </AppText>
        ) : null}
      </View>
      <Pressable accessibilityRole="button" onPress={exit} hitSlop={8} style={styles.exit}>
        <AppText variant="label" color={colors.action}>
          {strings.demo.exit}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radius.md,
    padding: spacing.sm,
    paddingLeft: spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand },
  text: { flex: 1 },
  exit: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
});
