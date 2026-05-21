import { Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import type { NewTaskInput } from '../types';

interface BrainDumpCardProps {
  onAdd: (input: NewTaskInput) => void;
}

/**
 * Frictionless capture: type a thought, hit return, it's saved (undated,
 * lands in the Projects → Inbox to organize later). Stays focused for a
 * rapid "dump everything" flow.
 */
export function BrainDumpCard({ onAdd }: BrainDumpCardProps) {
  const theme = useTheme();
  const { t } = useTranslation('tasks');
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd({ title: trimmed, category: 'personal', priority: 'low' });
    setText('');
  };

  return (
    <Card elevation="sm">
      <View style={styles.header}>
        <Sparkles size={18} color={theme.colors.primary} />
        <Text variant="bodyStrong">{t('brainDump.title')}</Text>
      </View>
      <Text variant="caption" color="textMuted" style={styles.hint}>
        {t('brainDump.hint')}
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={t('brainDump.placeholder')}
        placeholderTextColor={theme.colors.textMuted}
        returnKeyType="done"
        blurOnSubmit={false}
        onSubmitEditing={submit}
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
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hint: { marginTop: 4, marginBottom: 12 },
  input: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
});
