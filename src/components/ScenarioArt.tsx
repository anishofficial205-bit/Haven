import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { ArtKind } from '@/lib/scenarios';
import { FEATURE_TONE, shades } from '@/theme';

const L = shades[FEATURE_TONE.scenarios];
const INK = '#0C0C0C';

type Props = {
  kind: ArtKind;
  /** 'round' fills a circle on a pill; 'wide' sits the drawing in the top right of a hero */
  frame?: 'round' | 'wide';
  style?: StyleProp<ViewStyle>;
};

/**
 * The picture for a scenario. Placeholder artwork drawn from shapes in shades
 * of lilac: swap the drawings here when real illustrations exist.
 * Decoration only: hidden from screen readers.
 */
export function ScenarioArt({ kind, frame = 'round', style }: Props) {
  const id = useId().replace(/:/g, '');
  const face = (cx: number, cy: number, r: number) => (
    <G>
      <Path
        d="M16 58 C4 36 24 10 48 16 C72 4 98 28 88 52 C98 78 74 98 52 88 C30 98 6 82 16 58 Z"
        fill={`url(#${id}f)`}
        transform={`translate(${cx - r} ${cy - r}) scale(${r / 50})`}
      />
      <Circle cx={cx - r * 0.26} cy={cy - r * 0.04} r={r * 0.2} fill="#FFFFFF" />
      <Circle cx={cx + r * 0.26} cy={cy - r * 0.04} r={r * 0.2} fill="#FFFFFF" />
      <Circle cx={cx - r * 0.22} cy={cy - r * 0.02} r={r * 0.1} fill={INK} />
      <Circle cx={cx + r * 0.3} cy={cy - r * 0.02} r={r * 0.1} fill={INK} />
      <Ellipse cx={cx} cy={cy + r * 0.38} rx={r * 0.1} ry={r * 0.11} fill={INK} />
    </G>
  );
  const pal = (cx: number, cy: number, r: number) => (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${id}p)`} />
      <Circle cx={cx - r * 0.32} cy={cy - r * 0.08} r={r * 0.15} fill={L[7]} />
      <Circle cx={cx + r * 0.32} cy={cy - r * 0.08} r={r * 0.15} fill={L[7]} />
    </G>
  );

  return (
    <View style={[styles.clip, style]} aria-hidden>
      <Svg
        width="100%"
        height="100%"
        viewBox={frame === 'wide' ? '-100 -6 220 137' : '0 0 100 100'}
        preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={L[2]} />
            <Stop offset="0.65" stopColor={L[4]} />
            <Stop offset="1" stopColor={L[5]} />
          </LinearGradient>
          <RadialGradient id={`${id}f`} cx="32%" cy="24%" r="85%">
            <Stop offset="0" stopColor="#FFF0B8" />
            <Stop offset="0.5" stopColor="#FFB23D" />
            <Stop offset="1" stopColor="#E98312" />
          </RadialGradient>
          <RadialGradient id={`${id}p`} cx="32%" cy="26%" r="80%">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="0.5" stopColor={L[1]} />
            <Stop offset="1" stopColor={L[3]} />
          </RadialGradient>
        </Defs>
        <Rect x={-300} y={-300} width={800} height={800} fill={`url(#${id}b)`} />

        {kind === 'hug' ? (
          <>
            <Circle cx={78} cy={24} r={10} fill={L[0]} opacity={0.5} />
            {pal(68, 62, 20)}
            {face(36, 60, 25)}
          </>
        ) : null}
        {kind === 'phone' ? (
          <>
            <Rect x={32} y={14} width={34} height={70} rx={8} fill={L[7]} stroke={L[1]} strokeWidth={2.4} />
            <Rect x={37} y={26} width={18} height={7} rx={3.5} fill={L[2]} />
            <Rect x={45} y={38} width={16} height={7} rx={3.5} fill={L[0]} />
            <Rect x={37} y={50} width={13} height={7} rx={3.5} fill={L[2]} />
            {face(74, 72, 15)}
          </>
        ) : null}
        {kind === 'ask' ? (
          <>
            <Rect x={10} y={18} width={42} height={17} rx={8.5} fill={L[0]} />
            <Rect x={20} y={41} width={42} height={17} rx={8.5} fill={L[1]} opacity={0.8} />
            <Rect x={30} y={64} width={42} height={17} rx={8.5} fill={L[2]} opacity={0.7} />
            {face(76, 30, 17)}
          </>
        ) : null}
        {kind === 'two' ? (
          <>
            {frame === 'round' ? <Rect x={-300} y={76} width={800} height={300} fill={L[6]} opacity={0.6} /> : null}
            {pal(33, 52, 21)}
            {face(66, 56, 22)}
          </>
        ) : null}
        {kind === 'work' ? (
          <>
            {face(27, 50, 15)}
            {pal(75, 52, 13)}
            <Rect x={8} y={66} width={84} height={50} rx={7} fill={L[7]} />
            <Rect x={39} y={50} width={22} height={16} rx={3} fill={L[1]} />
          </>
        ) : null}
        {kind === 'photo' ? (
          <G transform="rotate(-7 50 50)">
            <Rect x={22} y={16} width={56} height={66} rx={4} fill="#FFFFFF" />
            <Rect x={27} y={21} width={46} height={44} fill={L[3]} />
            {face(50, 45, 16)}
          </G>
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
});
