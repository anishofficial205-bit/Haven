import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { SurfaceContext } from '@/hooks/useTheme';
import { radii, spacing, tilePalette, type BlockTone } from '@/theme';

type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

/** Each colour has its own sharp corner, so neighbouring tiles look cut to fit. */
const SHARP: Record<BlockTone, Corner> = {
  mint: 'topLeft',
  lime: 'bottomRight',
  rose: 'topRight',
  sky: 'topLeft',
};

type Props = {
  tone: BlockTone;
  children: ReactNode;
  onPress?: () => void;
  /** Screen-reader description of where tapping leads */
  accessibilityLabel?: string;
  /** Override which corner is the sharp one */
  sharp?: Corner;
  style?: StyleProp<ViewStyle>;
};

/**
 * A pastel puzzle piece: big rounded corners and one sharp one. Tiles sit
 * close together (see `tileGap`). Everything inside automatically uses
 * dark-on-light colours.
 */
export function Tile({ tone, children, onPress, accessibilityLabel, sharp, style }: Props) {
  const corner = sharp ?? SHARP[tone];
  const tileStyle = [
    styles.tile,
    { backgroundColor: tilePalette.blocks[tone] },
    { [`border${corner[0].toUpperCase()}${corner.slice(1)}Radius`]: radii.sharp },
    style,
  ];
  return (
    <SurfaceContext value={tilePalette}>
      {onPress ? (
        <PressableScale
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          style={tileStyle}>
          {children}
        </PressableScale>
      ) : (
        <View style={tileStyle}>{children}</View>
      )}
    </SurfaceContext>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.card,
    padding: spacing.md + 2,
    gap: spacing.sm + 2,
  },
});
