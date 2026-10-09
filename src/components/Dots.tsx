import { useId } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { usePageTheme } from '@/hooks/useTheme';

/**
 * The dotted texture behind every page. Sits behind the content, ignores
 * touches, and is hidden from screen readers.
 */
type Props = {
  /** Cover the whole window from wherever this is placed, instead of just the parent */
  window?: boolean;
};

export function Dots({ window }: Props) {
  const theme = usePageTheme();
  const size = useWindowDimensions();
  const id = useId().replace(/:/g, '');
  return (
    <View pointerEvents="none" style={[
        window ? { position: 'absolute', top: 0, left: 0, width: size.width, height: size.height } : StyleSheet.absoluteFill,
        { backgroundColor: theme.background },
      ]} aria-hidden>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id={id} width={11} height={11} patternUnits="userSpaceOnUse">
            <Circle cx={2} cy={2} r={1.05} fill={theme.dot} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
