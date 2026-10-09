import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radii, spacing } from '@/theme';

/**
 * A plain dark panel with a hairline edge. Anything read at length (posts,
 * replies, forms) sits on one of these. For colour, use Glow.
 */
export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View {...rest} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]} />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing.lg - 2,
    gap: spacing.sm + 2,
  },
});
