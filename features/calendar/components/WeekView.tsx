import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { CATEGORY_COLOR_KEY, tasksForDate, type Task } from '@/features/tasks';
import { useTheme } from '@/theme';
import { formatTime, isSameDay, weekDays, weekStartsOnForLocale } from '@/utils/date';
import { LOAD_COLOR_KEY, dayLoad } from '../selectors';

interface WeekViewProps {
  tasks: Task[];
  weekDate: Date;
  locale: string;
  onSelectDay: (date: Date) => void;
  onPressTask: (task: Task) => void;
}

export function WeekView({ tasks, weekDate, locale, onSelectDay, onPressTask }: WeekViewProps) {
  const theme = useTheme();
  const { t } = useTranslation('calendar');
  const days = weekDays(weekDate, weekStartsOnForLocale(locale));
  const today = new Date();

  const dayLabel = (d: Date) =>
    new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric' }).format(d);

  return (
    <View style={styles.list}>
      {days.map((day) => {
        const dayTasks = tasksForDate(tasks, day);
        const load = dayLoad(tasks, day);
        const isToday = isSameDay(day, today);
        return (
          <Card key={day.toISOString()} elevation="sm">
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelectDay(day)}
              style={styles.header}
            >
              <Text variant="bodyStrong" color={isToday ? 'primary' : 'text'}>
                {dayLabel(day)}
              </Text>
              {load !== 'free' ? (
                <View style={[styles.pill, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <View
                    style={[
                      styles.pillDot,
                      { backgroundColor: theme.colors[LOAD_COLOR_KEY[load]] },
                    ]}
                  />
                  <Text variant="caption" color="textMuted">
                    {t(`load.${load}`)}
                  </Text>
                </View>
              ) : null}
            </Pressable>

            {dayTasks.length === 0 ? (
              <Text variant="caption" color="textMuted" style={styles.empty}>
                {t('noTasks')}
              </Text>
            ) : (
              <View style={styles.tasks}>
                {dayTasks.map((task) => {
                  const color = theme.colors[CATEGORY_COLOR_KEY[task.category]];
                  return (
                    <Pressable
                      key={task.id}
                      accessibilityRole="button"
                      onPress={() => onPressTask(task)}
                      style={styles.taskRow}
                    >
                      <View style={[styles.bar, { backgroundColor: color }]} />
                      {task.time ? (
                        <Text variant="caption" color="textMuted" style={styles.time}>
                          {formatTime(task.time, locale)}
                        </Text>
                      ) : null}
                      <Text
                        variant="body"
                        numberOfLines={1}
                        color={task.completed ? 'textMuted' : 'text'}
                        style={[styles.taskTitle, task.completed && styles.done]}
                      >
                        {task.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { marginTop: 10 },
  tasks: { marginTop: 12, gap: 10 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bar: { width: 4, height: 20, borderRadius: 2 },
  time: { width: 48 },
  taskTitle: { flex: 1 },
  done: { textDecorationLine: 'line-through' },
});
