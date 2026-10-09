import { StyleSheet, View, type ViewProps } from 'react-native';

import { SurfaceContext } from '@/hooks/useTheme';
import { paperPalette, radii, spacing } from '@/theme';

/**
 * A paper card: plain off-white, evenly rounded.
 * Everything inside it automatically uses dark-on-light colours.
 * For a block of pastel colour, use Tile instead.
 */
export function Card({ style, ...rest }: ViewProps) {
  return (
    <SurfaceContext value={paperPalette}>
      <View
        {...rest}
        style={[styles.card, { backgroundColor: paperPalette.surface }, style]}
      />
    </SurfaceContext>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: spacing.md + 2,
    gap: spacing.sm + 2,
  },
});
