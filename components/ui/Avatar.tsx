import { StyleSheet, View } from 'react-native';

import { Mascot, type MascotMood } from '@/components/illustrations';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface AvatarProps {
  /** When provided, shows initials; otherwise shows the mascot. */
  name?: string;
  size?: number;
  mood?: MascotMood;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ name, size = 48, mood = 'happy' }: AvatarProps) {
  const theme = useTheme();
  const text = name ? initials(name) : '';

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.primarySoft,
        },
      ]}
    >
      {text ? (
        <Text variant="bodyStrong" color="primary">
          {text}
        </Text>
      ) : (
        <Mascot mood={mood} size={size * 0.86} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
