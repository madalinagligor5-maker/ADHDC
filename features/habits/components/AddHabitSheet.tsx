import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet, Button, Chip, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { formatTime } from '@/utils/date';
import { HabitIcon, HABIT_ICON_KEYS } from '../HabitIcon';
import { HABIT_COLORS, type NewHabitInput } from '../types';

interface AddHabitSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NewHabitInput) => void;
}

const REMINDER_PRESETS: (string | null)[] = [null, '08:00', '12:00', '18:00', '21:00'];

export function AddHabitSheet({ visible, onClose, onSubmit }: AddHabitSheetProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation('habits');

  const [name, setName] = useState('');
  const [color, setColor] = useState(HABIT_COLORS[0] ?? '#6C5CE7');
  const [icon, setIcon] = useState(HABIT_ICON_KEYS[0] ?? 'sparkles');
  const [reminder, setReminder] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setColor(HABIT_COLORS[0] ?? '#6C5CE7');
    setIcon(HABIT_ICON_KEYS[0] ?? 'sparkles');
    setReminder(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, color, icon, reminderTime: reminder });
    reset();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={t('add.title')}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t('add.namePlaceholder')}
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

      <Label text={t('add.icon')} />
      <View style={styles.icons}>
        {HABIT_ICON_KEYS.map((key) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected: icon === key }}
            onPress={() => setIcon(key)}
            style={[
              styles.iconCell,
              {
                backgroundColor: icon === key ? `${color}22` : theme.colors.surfaceAlt,
                borderColor: icon === key ? color : 'transparent',
              },
            ]}
          >
            <HabitIcon name={key} color={icon === key ? color : theme.colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <Label text={t('add.color')} />
      <View style={styles.colors}>
        {HABIT_COLORS.map((c) => (
          <Pressable
            key={c}
            accessibilityRole="button"
            accessibilityState={{ selected: color === c }}
            onPress={() => setColor(c)}
            style={[
              styles.swatch,
              { backgroundColor: c },
              color === c && { borderColor: theme.colors.text, borderWidth: 3 },
            ]}
          />
        ))}
      </View>

      <Label text={t('add.reminder')} />
      <View style={styles.chips}>
        {REMINDER_PRESETS.map((preset) => (
          <Chip
            key={preset ?? 'none'}
            label={preset ? formatTime(preset, i18n.language) : t('add.noReminder')}
            selected={reminder === preset}
            onPress={() => setReminder(preset)}
          />
        ))}
      </View>

      <Button label={t('add.save')} onPress={submit} disabled={!name.trim()} style={styles.cta} />
    </BottomSheet>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text variant="caption" color="textMuted" style={styles.label}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 4,
  },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconCell: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: { width: 40, height: 40, borderRadius: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cta: { marginTop: 24 },
});
