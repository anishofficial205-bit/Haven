import { useId } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { Feature } from '@/theme';

/**
 * Each area of the app has its own glossy character, so a block reads as a
 * place with a face. Placeholder artwork built from gradients: swap the
 * drawing here when illustrated characters exist.
 * Decoration only: hidden from screen readers.
 */
const LOOKS: Record<Feature, { colors: [string, string, string]; shape: 'blob' | 'round' | 'square' | 'dome'; mouth: 'oh' | 'smile' | 'flat' }> = {
  scenarios: { colors: ['#FFF0B8', '#FFB23D', '#E98312'], shape: 'blob', mouth: 'oh' },
  confess: { colors: ['#FFE1F2', '#FF8FCD', '#C2267A'], shape: 'round', mouth: 'oh' },
  spaces: { colors: ['#EEF1FF', '#A9B8FF', '#4A60D8'], shape: 'square', mouth: 'smile' },
  help: { colors: ['#EAFFF6', '#9AF0CC', '#1F9A78'], shape: 'dome', mouth: 'flat' },
  profile: { colors: ['#FFF3A8', '#E8FF2A', '#9FBF00'], shape: 'blob', mouth: 'smile' },
};
const INK = '#0C0C0C';

type Props = {
  feature: Feature;
  size?: number;
};

export function Mascot({ feature, size = 64 }: Props) {
  const id = useId().replace(/:/g, '');
  const look = LOOKS[feature];
  const fill = `url(#${id})`;
  return (
    // Wrapped in a View so it layers correctly above a glow behind it.
    <View style={{ width: size, height: size }} aria-hidden>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={id} cx="32%" cy="24%" r="85%">
            <Stop offset="0" stopColor={look.colors[0]} />
            <Stop offset="0.5" stopColor={look.colors[1]} />
            <Stop offset="1" stopColor={look.colors[2]} />
          </RadialGradient>
        </Defs>
        {look.shape === 'blob' ? (
          <Path d="M16 58 C4 36 24 10 48 16 C72 4 98 28 88 52 C98 78 74 98 52 88 C30 98 6 82 16 58 Z" fill={fill} />
        ) : null}
        {look.shape === 'round' ? <Ellipse cx={50} cy={52} rx={43} ry={41} fill={fill} /> : null}
        {look.shape === 'square' ? <Rect x={9} y={11} width={82} height={82} rx={28} fill={fill} /> : null}
        {look.shape === 'dome' ? <Path d="M8 94 V52 A42 42 0 0 1 92 52 V94 Z" fill={fill} /> : null}

        <Circle cx={37} cy={48} r={11} fill="#FFFFFF" />
        <Circle cx={63} cy={48} r={11} fill="#FFFFFF" />
        <Circle cx={39} cy={49} r={5.5} fill={INK} />
        <Circle cx={65} cy={49} r={5.5} fill={INK} />
        {look.mouth === 'oh' ? <Ellipse cx={50} cy={69} rx={5} ry={5.5} fill={INK} /> : null}
        {look.mouth === 'smile' ? (
          <Path d="M41 66 Q50 75 59 66" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
        ) : null}
        {look.mouth === 'flat' ? <Rect x={42} y={66} width={16} height={5} rx={2.5} fill={INK} /> : null}
      </Svg>
    </View>
  );
}
