import { StyleSheet, View, type ViewProps } from 'react-native';

import { SurfaceContext } from '@/hooks/useTheme';
import { paperPalette, radii, spacing } from '@/theme';

/**
 * A paper card: off-white with an ink outline and one sharp corner.
 * Everything inside it automatically uses dark-on-light colours.
 * For a block of pastel colour, use Tile instead.
 */
export function Card({ style, ...rest }: ViewProps) {
  return (
    <SurfaceContext value={paperPalette}>
      <View
        {...rest}
        style={[styles.card, { backgroundColor: paperPalette.surface, borderColor: paperPalette.border }, style]}
      />
    </SurfaceContext>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderBottomRightRadius: radii.sharp,
    borderWidth: 1.5,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
