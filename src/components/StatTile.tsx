import { StyleSheet } from 'react-native';

import { colors } from '@/theme';
import { AppText } from './AppText';
import { Card } from './Card';

interface StatTileProps {
  label: string;
  value: string;
  valueColor?: string;
}

export function StatTile({ label, value, valueColor = colors.text }: StatTileProps) {
  return (
    <Card style={styles.tile}>
      <AppText variant="caption" color={colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="heading" color={valueColor} style={styles.value}>
        {value}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: 4 },
  value: { fontSize: 24, lineHeight: 30 },
});
