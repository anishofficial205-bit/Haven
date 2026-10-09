import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radii, spacing } from '@/theme';

/** A plain outlined card. For a block of colour, use Tile instead. */
export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 1.5,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
