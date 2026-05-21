import { StyleSheet, Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import type { Task } from '@/features/tasks';
import { useTheme } from '@/theme';
import { isSameDay, monthMatrix, weekStartsOnForLocale, weekdayNarrow } from '@/utils/date';
import { LOAD_COLOR_KEY, dayLoad } from '../selectors';

interface MonthViewProps {
  tasks: Task[];
  monthDate: Date;
  selectedDate: Date;
  locale: string;
  onSelectDay: (date: Date) => void;
}

export function MonthView({ tasks, monthDate, selectedDate, locale, onSelectDay }: MonthViewProps) {
  const theme = useTheme();
  const ws = weekStartsOnForLocale(locale);
  const weeks = monthMatrix(monthDate, ws);
  const today = new Date();
  const month = monthDate.getMonth();

  return (
    <View>
      <View style={styles.headerRow}>
        {weeks[0]?.map((d) => (
          <Text
            key={d.toISOString()}
            variant="caption"
            color="textMuted"
            center
            style={styles.cell}
          >
            {weekdayNarrow(d, locale)}
          </Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day) => {
            const inMonth = day.getMonth() === month;
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            const load = dayLoad(tasks, day);
            const dotColor = theme.colors[LOAD_COLOR_KEY[load]];

            return (
              <Pressable
                key={day.toISOString()}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelectDay(day)}
                style={styles.cell}
              >
                <View
                  style={[
                    styles.dayPill,
                    isToday && { borderColor: theme.colors.primary, borderWidth: 1.5 },
                    isSelected && { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text
                    variant="caption"
                    color={isSelected ? 'onPrimary' : inMonth ? 'text' : 'textMuted'}
                  >
                    {day.getDate()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.loadDot,
                    { backgroundColor: load === 'free' ? 'transparent' : dotColor },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', marginBottom: 8 },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  cell: { flex: 1, alignItems: 'center', gap: 4 },
  dayPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadDot: { width: 6, height: 6, borderRadius: 3 },
});
