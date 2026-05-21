import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { isSameDay, toISODate, weekDays, weekStartsOnForLocale, weekdayNarrow } from '@/utils/date';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface WeekStripProps {
  selectedDate?: Date;
  onSelectDay?: (date: Date) => void;
  /** ISO `YYYY-MM-DD` keys that should show an activity dot. */
  activeDates?: string[];
}

export function WeekStrip({ selectedDate, onSelectDay, activeDates = [] }: WeekStripProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const today = new Date();
  const selected = selectedDate ?? today;

  const days = weekDays(selected, weekStartsOnForLocale(locale));
  const activeSet = new Set(activeDates);

  return (
    <View style={styles.row}>
      {days.map((day) => {
        const isToday = isSameDay(day, today);
        const isSelected = isSameDay(day, selected);
        const hasActivity = activeSet.has(toISODate(day));

        return (
          <Pressable
            key={day.toISOString()}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectDay?.(day)}
            style={styles.cell}
          >
            <Text variant="caption" color={isSelected ? 'primary' : 'textMuted'}>
              {weekdayNarrow(day, locale)}
            </Text>
            <View
              style={[
                styles.datePill,
                isToday && { borderColor: theme.colors.primary, borderWidth: 1.5 },
                isSelected && { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                variant="bodyStrong"
                color={isSelected ? 'onPrimary' : isToday ? 'primary' : 'text'}
              >
                {day.getDate()}
              </Text>
            </View>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: hasActivity ? theme.colors.teal : 'transparent',
                },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { alignItems: 'center', gap: 6, flex: 1 },
  datePill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
