import { ArrowUpRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, type BlockTone } from '@/theme';

type Props = {
  tone: BlockTone;
  children: ReactNode;
  onPress?: () => void;
  /** Screen-reader description of where tapping leads */
  accessibilityLabel?: string;
  /** A round arrow button that bites into the bottom-right corner */
  arrow?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * A solid block of colour. Tiles sit close together and share big rounded
 * corners, so a group of them reads as one puzzle. Text on a tile uses
 * `theme.ink`, in light and dark mode alike.
 */
export function Tile({ tone, children, onPress, accessibilityLabel, arrow, style }: Props) {
  const theme = useTheme();
  const body = (
    <>
      {children}
      {arrow ? (
        // The ring is the page colour, so the button looks cut out of the tile.
        <View style={[styles.arrowRing, { backgroundColor: theme.background }]}>
          <View style={[styles.arrow, { backgroundColor: theme.primary }]}>
            <ArrowUpRight size={22} color={theme.onPrimary} />
          </View>
        </View>
      ) : null}
    </>
  );
  const tileStyle = [styles.tile, { backgroundColor: theme.blocks[tone] }, arrow && styles.withArrow, style];

  if (!onPress) return <View style={tileStyle}>{body}</View>;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={tileStyle}>
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  withArrow: {
    paddingBottom: spacing.xl + spacing.lg,
  },
  arrowRing: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
