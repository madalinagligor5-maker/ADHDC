import { Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import {
  addDays,
  isSameDay,
  startOfDay,
  startOfWeek,
  toISODate,
  weekStartsOnForLocale,
  weekdayNarrow,
} from '@/utils/date';
import { HabitIcon } from '../HabitIcon';
import { currentStreak, doneDates } from '../selectors';
import type { Habit, HabitLog } from '../types';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  view: 'week' | 'month';
  onToggle: (habitId: string, date: Date) => void;
  onDelete: (id: string) => void;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function HabitCard({ habit, logs, view, onToggle, onDelete }: HabitCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation('habits');

  const done = doneDates(logs, habit.id);
  const streak = currentStreak(done);
  const today = startOfDay(new Date());
  const ws = weekStartsOnForLocale(i18n.language);

  const gridStart = view === 'week' ? startOfWeek(today, ws) : addDays(startOfWeek(today, ws), -28);
  const length = view === 'week' ? 7 : 35;
  const days = Array.from({ length }, (_, i) => addDays(gridStart, i));
  const headerDays = days.slice(0, 7);
  const rows = chunk(days, 7);
  const cellSize = view === 'week' ? 34 : 22;

  return (
    <Card elevation="sm" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBubble, { backgroundColor: `${habit.color}22` }]}>
          <HabitIcon name={habit.icon} color={habit.color} />
        </View>
        <View style={styles.headerText}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {habit.name}
          </Text>
          <Text variant="caption" color="textMuted">
            {streak > 0 ? `🔥 ${t('streak.days', { count: streak })}` : t('freshStart')}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('delete')}
          hitSlop={8}
          onPress={() => onDelete(habit.id)}
        >
          <Trash2 size={18} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.gridHeader}>
        {headerDays.map((d) => (
          <Text
            key={d.toISOString()}
            variant="caption"
            color="textMuted"
            center
            style={{ width: cellSize }}
          >
            {weekdayNarrow(d, i18n.language)}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.gridRow}>
            {row.map((day) => {
              const isFuture = day.getTime() > today.getTime();
              const isToday = isSameDay(day, today);
              const completed = done.has(toISODate(day));
              return (
                <Pressable
                  key={day.toISOString()}
                  accessibilityRole="button"
                  accessibilityState={{ selected: completed, disabled: isFuture }}
                  disabled={isFuture}
                  onPress={() => onToggle(habit.id, day)}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      borderRadius: cellSize * 0.32,
                      backgroundColor: completed ? habit.color : theme.colors.surfaceAlt,
                      opacity: isFuture ? 0.3 : 1,
                      borderWidth: isToday ? 2 : 0,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  gridHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  grid: { gap: 6 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: {},
});
