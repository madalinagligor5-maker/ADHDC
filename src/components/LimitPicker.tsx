import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LIMIT_SUGGESTIONS, MAX_LIMIT, MIN_LIMIT } from '@/domain/score';
import { format, useStrings } from '@/i18n';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';
import { Chip } from './Chip';
import { NumberField } from './NumberField';

interface LimitPickerProps {
  value: number;
  /** Called with a valid limit, or `null` while the custom value is invalid. */
  onChange: (value: number | null) => void;
}

export function isValidDailyLimit(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_LIMIT && value <= MAX_LIMIT;
}

export function LimitPicker({ value, onChange }: LimitPickerProps) {
  const strings = useStrings();
  const s = strings.onboarding;
  const isSuggestion = (LIMIT_SUGGESTIONS as readonly number[]).includes(value);
  const [custom, setCustom] = useState(!isSuggestion);
  const [text, setText] = useState(isSuggestion ? '' : String(value));
  const customValue = Number(text);
  const invalid = custom && text !== '' && !isValidDailyLimit(customValue);

  return (
    <View style={styles.wrap}>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {LIMIT_SUGGESTIONS.map((option) => (
          <Chip
            key={option}
            label={format(s.limitOption, { n: option })}
            selected={!custom && value === option}
            onPress={() => {
              setCustom(false);
              onChange(option);
            }}
          />
        ))}
        <Chip
          label={s.limitCustom}
          selected={custom}
          onPress={() => {
            setCustom(true);
            onChange(isValidDailyLimit(customValue) ? customValue : null);
          }}
        />
      </View>
      {custom ? (
        <>
          <NumberField
            label={s.limitCustomLabel}
            value={text}
            suffix={strings.common.minutesShort}
            invalid={invalid}
            onChangeText={(next) => {
              setText(next);
              const parsed = Number(next);
              onChange(next !== '' && isValidDailyLimit(parsed) ? parsed : null);
            }}
          />
          {invalid ? (
            <AppText variant="caption" color={colors.warning}>
              {format(s.limitInvalid, { min: MIN_LIMIT, max: MAX_LIMIT })}
            </AppText>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
