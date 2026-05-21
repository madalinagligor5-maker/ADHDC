import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/theme';

type Option = { key: 'system' | SupportedLanguage };

const OPTIONS: Option[] = [
  { key: 'system' },
  ...SUPPORTED_LANGUAGES.map((l) => ({ key: l }) as Option),
];

export function LanguageSwitcher() {
  const theme = useTheme();
  const { t } = useTranslation(['settings', 'common']);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const selectedKey: Option['key'] = language ?? 'system';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      {OPTIONS.map((option, index) => {
        const isSelected = option.key === selectedKey;
        const label =
          option.key === 'system'
            ? t('settings:language.system')
            : t(`common:languageNames.${option.key}`);

        return (
          <Pressable
            key={option.key}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={label}
            onPress={() => setLanguage(option.key === 'system' ? null : option.key)}
            style={({ pressed }) => [
              styles.row,
              index > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: theme.colors.border,
              },
              pressed && { backgroundColor: theme.colors.primaryTint },
            ]}
          >
            <Text
              style={[
                theme.typography.body,
                { color: isSelected ? theme.colors.primary : theme.colors.text },
              ]}
            >
              {label}
            </Text>
            {isSelected && (
              <Text style={[theme.typography.bodyStrong, { color: theme.colors.primary }]}>✓</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
});
