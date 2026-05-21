import { Flag, ListTree } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryTag, Checkbox, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { formatTime } from '@/utils/date';
import { CATEGORY_COLOR_KEY, PRIORITY_COLOR_KEY } from '../meta';
import type { Task } from '../types';

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  onPress?: (task: Task) => void;
  subtaskDone?: number;
  subtaskTotal?: number;
}

export function TaskRow({
  task,
  onToggle,
  onPress,
  subtaskDone = 0,
  subtaskTotal = 0,
}: TaskRowProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation('tasks');

  const categoryColor = theme.colors[CATEGORY_COLOR_KEY[task.category]];
  const priorityKey = PRIORITY_COLOR_KEY[task.priority];
  const priorityColor = priorityKey ? theme.colors[priorityKey] : null;

  const body = (
    <>
      <Checkbox
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        accessibilityLabel={task.title}
      />
      <View style={styles.content}>
        <Text
          variant="bodyStrong"
          color={task.completed ? 'textMuted' : 'text'}
          numberOfLines={2}
          style={task.completed ? styles.done : undefined}
        >
          {task.title}
        </Text>
        <View style={styles.meta}>
          {task.time ? (
            <Text variant="caption" color="textMuted">
              {formatTime(task.time, i18n.language)}
            </Text>
          ) : null}
          <CategoryTag label={t(`categories.${task.category}`)} color={categoryColor} />
          {priorityColor ? <Flag size={14} color={priorityColor} fill={priorityColor} /> : null}
          {subtaskTotal > 0 ? (
            <View style={styles.subtaskBadge}>
              <ListTree size={13} color={theme.colors.textMuted} />
              <Text variant="caption" color="textMuted">
                {subtaskDone}/{subtaskTotal}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => onPress(task)}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
      >
        {body}
      </Pressable>
    );
  }
  return <View style={styles.row}>{body}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  content: { flex: 1, gap: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  subtaskBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  done: { textDecorationLine: 'line-through' },
});
