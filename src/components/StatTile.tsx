import { StyleSheet } from 'react-native';

import { colors } from '@/theme';
import { AppText } from './AppText';
import { Card } from './Card';

interface StatTileProps {
  label: string;
  value: string;
  valueColor?: string;
  footnote?: string;
}

export function StatTile({ label, value, valueColor = colors.text, footnote }: StatTileProps) {
  return (
    <Card style={styles.tile}>
      <AppText variant="caption" color={colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="number" color={valueColor}>
        {value}
      </AppText>
      {footnote ? (
        <AppText variant="caption" color={colors.textFaint}>
          {footnote}
        </AppText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flexGrow: 1, flexBasis: 140, gap: 4 },
});
