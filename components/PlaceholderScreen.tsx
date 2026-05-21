import { View } from 'react-native';

import { EmptyState, Screen } from '@/components/ui';
import type { MascotMood } from '@/components/illustrations';

interface PlaceholderScreenProps {
  title: string;
  message: string;
  mood?: MascotMood;
}

/** Temporary friendly placeholder for screens built in later phases. */
export function PlaceholderScreen({
  title,
  message,
  mood = 'encouraging',
}: PlaceholderScreenProps) {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState title={title} message={message} mood={mood} />
      </View>
    </Screen>
  );
}
