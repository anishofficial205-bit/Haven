import { useId, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { PressableScale } from '@/components/PressableScale';
import { glows, radii, spacing, type GlowTone } from '@/theme';

type Props = {
  tone: GlowTone;
  /** Override the tone's three stops (light, mid, deep), for shades inside one area */
  colors?: readonly [string, string, string];
  children?: ReactNode;
  onPress?: () => void;
  /** Screen-reader description of where tapping leads */
  accessibilityLabel?: string;
  /** Which corner the light comes from */
  light?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
};

/**
 * A block lit from inside: bright in one top corner, falling away to a deep
 * shade of the same colour. Text on a glow is white. Use it for things that
 * are special (a hero, a feature, a warning), not for long reading.
 */
export function Glow({ tone, colors, children, onPress, accessibilityLabel, light = 'left', style }: Props) {
  const id = useId().replace(/:/g, '');
  const [bright, mid, deep] = colors ?? glows[tone];
  const body = (
    <>
      <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <RadialGradient id={id} cx={light === 'left' ? '12%' : '88%'} cy="0%" r="135%" gradientUnits="objectBoundingBox">
              <Stop offset="0" stopColor={bright} />
              <Stop offset="0.52" stopColor={mid} />
              <Stop offset="1" stopColor={deep} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      </View>
      {children}
    </>
  );
  const blockStyle = [styles.block, style];
  if (!onPress) return <View style={blockStyle}>{body}</View>;
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={blockStyle}>
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  block: {
    borderRadius: radii.card,
    padding: spacing.lg - 2,
    gap: spacing.sm,
    overflow: 'hidden',
    // A faint rim, like light catching the edge
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
