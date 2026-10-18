import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useStrings } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

interface ScreenHeaderProps {
  title: string;
  /** Shows a close (✕) button instead of a back arrow. */
  modal?: boolean;
  showBack?: boolean;
}

export function ScreenHeader({ title, modal = false, showBack = true }: ScreenHeaderProps) {
  const strings = useStrings();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={modal ? strings.common.close : strings.common.back}
          onPress={goBack}
          hitSlop={12}
          style={styles.icon}
        >
          <Ionicons name={modal ? 'close' : 'chevron-back'} size={24} color={colors.text} />
        </Pressable>
      ) : null}
      <AppText variant="title" style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
});
