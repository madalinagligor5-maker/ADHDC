import { AlarmClock, Check } from 'lucide-react-native';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Text } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Task } from '../types';
import { TaskRow } from './TaskRow';

interface SwipeableTaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  onSnooze: (id: string) => void;
  onPress?: (task: Task) => void;
  subtaskDone?: number;
  subtaskTotal?: number;
}

export function SwipeableTaskRow({
  task,
  onToggle,
  onSnooze,
  onPress,
  subtaskDone,
  subtaskTotal,
}: SwipeableTaskRowProps) {
  const theme = useTheme();
  const { t } = useTranslation('tasks');
  const ref = useRef<SwipeableMethods>(null);

  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={2}
      leftThreshold={56}
      rightThreshold={56}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={() => (
        <View style={[styles.action, { backgroundColor: theme.colors.success }]}>
          <Check size={20} color={theme.colors.onSuccess} />
          <Text variant="caption" color="onSuccess">
            {t('swipe.complete')}
          </Text>
        </View>
      )}
      renderRightActions={() => (
        <View style={[styles.action, styles.right, { backgroundColor: theme.colors.mustard }]}>
          <AlarmClock size={20} color={theme.colors.text} />
          <Text variant="caption">{t('swipe.snooze')}</Text>
        </View>
      )}
      onSwipeableOpen={(direction) => {
        if (direction === 'left') {
          onToggle(task.id);
        } else {
          onSnooze(task.id);
        }
        ref.current?.close();
      }}
    >
      <View style={[styles.rowWrap, { backgroundColor: theme.colors.surface }]}>
        <TaskRow
          task={task}
          onToggle={onToggle}
          onPress={onPress}
          subtaskDone={subtaskDone}
          subtaskTotal={subtaskTotal}
        />
      </View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  rowWrap: { paddingHorizontal: 16 },
  action: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  right: { alignItems: 'center' },
});
