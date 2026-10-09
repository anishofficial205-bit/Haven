import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { glows, type GlowTone } from '@/theme';

type Props = {
  size?: number;
  /** The colour of the area it appears in */
  tone?: GlowTone;
};

/**
 * The one avatar shown on all public content, whoever wrote it:
 * a small white ghost on the area's colour.
 */
export function AnonymousAvatar({ size = 28, tone = 'pink' }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: glows[tone][1],
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 100 100">
        <Path d="M14 94 V46 A36 36 0 0 1 86 46 V94 L72 82 L58 94 L44 82 L30 94 Z" fill="#FFFFFF" />
        <Rect x={30} y={40} width={14} height={16} rx={7} fill={glows[tone][2]} />
        <Rect x={56} y={40} width={14} height={16} rx={7} fill={glows[tone][2]} />
      </Svg>
    </View>
  );
}
