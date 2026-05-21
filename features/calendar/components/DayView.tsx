import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { CATEGORY_COLOR_KEY, type Task } from '@/features/tasks';
import { useTheme } from '@/theme';
import { formatTime } from '@/utils/date';
import { timedTasks, untimedTasks } from '../selectors';

interface DayViewProps {
  tasks: Task[];
  date: Date;
  locale: string;
  onPressTask: (task: Task) => void;
}

const START_HOUR = 6;
const END_HOUR = 23;
const HOUR_HEIGHT = 56;

function minutesFromStart(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return ((h ?? 0) - START_HOUR) * 60 + (m ?? 0);
}

export function DayView({ tasks, date, locale, onPressTask }: DayViewProps) {
  const theme = useTheme();
  const { t } = useTranslation('calendar');

  const timed = timedTasks(tasks, date);
  const untimed = untimedTasks(tasks, date);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const timelineHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  return (
    <View>
      {untimed.length > 0 ? (
        <View style={styles.anytime}>
          <Text variant="caption" color="textMuted" style={styles.anytimeLabel}>
            {t('anytime')}
          </Text>
          <View style={styles.anytimeList}>
            {untimed.map((task) => {
              const color = theme.colors[CATEGORY_COLOR_KEY[task.category]];
              return (
                <Pressable
                  key={task.id}
                  accessibilityRole="button"
                  onPress={() => onPressTask(task)}
                  style={[styles.anytimeChip, { backgroundColor: `${color}22` }]}
                >
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text variant="caption" numberOfLines={1}>
                    {task.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={[styles.timeline, { height: timelineHeight }]}>
        {hours.map((hour, i) => (
          <View key={hour} style={[styles.hourRow, { top: i * HOUR_HEIGHT }]}>
            <Text variant="caption" color="textMuted" style={styles.hourLabel}>
              {formatTime(`${`${hour}`.padStart(2, '0')}:00`, locale)}
            </Text>
            <View style={[styles.hourLine, { backgroundColor: theme.colors.border }]} />
          </View>
        ))}

        {timed.map((task) => {
          if (!task.time) return null;
          const top = Math.max(0, (minutesFromStart(task.time) / 60) * HOUR_HEIGHT);
          const height = Math.max(30, ((task.estimatedMinutes ?? 30) / 60) * HOUR_HEIGHT - 4);
          const color = theme.colors[CATEGORY_COLOR_KEY[task.category]];
          return (
            <Pressable
              key={task.id}
              accessibilityRole="button"
              onPress={() => onPressTask(task)}
              style={[
                styles.block,
                { top, height, backgroundColor: `${color}22`, borderLeftColor: color },
              ]}
            >
              <Text variant="caption" color="textMuted">
                {formatTime(task.time, locale)}
              </Text>
              <Text variant="bodyStrong" numberOfLines={1}>
                {task.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const LABEL_W = 52;

const styles = StyleSheet.create({
  anytime: { marginBottom: 16 },
  anytimeLabel: { textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  anytimeList: { gap: 8 },
  anytimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  timeline: { position: 'relative' },
  hourRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center' },
  hourLabel: { width: LABEL_W },
  hourLine: { flex: 1, height: StyleSheet.hairlineWidth },
  block: {
    position: 'absolute',
    left: LABEL_W,
    right: 0,
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
  },
});
