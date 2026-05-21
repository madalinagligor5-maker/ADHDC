import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet, Button, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { PROJECT_COLORS, type NewProjectInput } from '../types';

interface NewProjectSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NewProjectInput) => void;
}

export function NewProjectSheet({ visible, onClose, onSubmit }: NewProjectSheetProps) {
  const theme = useTheme();
  const { t } = useTranslation('tasks');
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0] ?? '#6C5CE7');

  const reset = () => {
    setName('');
    setColor(PROJECT_COLORS[0] ?? '#6C5CE7');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, color });
    reset();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={t('projects.newProject')}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t('projects.namePlaceholder')}
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
        {t('projects.color')}
      </Text>
      <View style={styles.colors}>
        {PROJECT_COLORS.map((c) => (
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

      <Button
        label={t('projects.add')}
        onPress={submit}
        disabled={!name.trim()}
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
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 4,
  },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: { width: 40, height: 40, borderRadius: 20 },
  cta: { marginTop: 24 },
});
