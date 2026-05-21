import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet, Button, Chip, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { formatTime } from '@/utils/date';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type NewTaskInput,
  type TaskCategory,
  type TaskPriority,
} from '../types';

interface QuickAddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NewTaskInput) => void;
  /** Pre-fill the due date (e.g. today's ISO date). */
  defaultDueDate?: string | null;
}

const TIME_PRESETS: (string | null)[] = [null, '09:00', '12:00', '15:00', '18:00', '21:00'];

export function QuickAddTaskSheet({
  visible,
  onClose,
  onSubmit,
  defaultDueDate = null,
}: QuickAddTaskSheetProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation('tasks');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [time, setTime] = useState<string | null>(null);

  const reset = () => {
    setTitle('');
    setCategory('personal');
    setPriority('medium');
    setTime(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({ title: trimmed, category, priority, time, dueDate: defaultDueDate });
    reset();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={t('quickAdd.title')}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={t('quickAdd.titlePlaceholder')}
        placeholderTextColor={theme.colors.textMuted}
        autoFocus
        style={[
          styles.input,
          theme.typography.body,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
      />

      <Text variant="caption" color="textMuted" style={styles.label}>
        {t('quickAdd.category')}
      </Text>
      <View style={styles.chips}>
        {TASK_CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={t(`categories.${c}`)}
            selected={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </View>

      <Text variant="caption" color="textMuted" style={styles.label}>
        {t('quickAdd.priority')}
      </Text>
      <View style={styles.chips}>
        {TASK_PRIORITIES.map((p) => (
          <Chip
            key={p}
            label={t(`priorities.${p}`)}
            selected={priority === p}
            onPress={() => setPriority(p)}
          />
        ))}
      </View>

      <Text variant="caption" color="textMuted" style={styles.label}>
        {t('quickAdd.time')}
      </Text>
      <View style={styles.chips}>
        {TIME_PRESETS.map((preset) => (
          <Chip
            key={preset ?? 'anytime'}
            label={preset ? formatTime(preset, i18n.language) : t('quickAdd.anytime')}
            selected={time === preset}
            onPress={() => setTime(preset)}
          />
        ))}
      </View>

      <Button
        label={t('quickAdd.save')}
        onPress={handleSubmit}
        disabled={!title.trim()}
        style={styles.cta}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    marginBottom: 4,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cta: { marginTop: 24 },
});
