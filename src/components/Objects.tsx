import { useId } from 'react';
import Svg, { Circle, Defs, G, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * Glossy decorative objects that poke out of a block. They are built from
 * gradients as stand-ins; swap in real 3D renders here when they exist.
 * Decoration only: hidden from screen readers.
 */

/** A gold, six-armed asterisk. */
export function Asterisk({ size = 110 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <Defs>
        <RadialGradient id={id} cx="35%" cy="28%" r="80%">
          <Stop offset="0" stopColor="#FFF0B8" />
          <Stop offset="0.55" stopColor="#FFB23D" />
          <Stop offset="1" stopColor="#E98312" />
        </RadialGradient>
      </Defs>
      <G fill={`url(#${id})`}>
        <Rect x={38} y={6} width={24} height={88} rx={12} />
        <Rect x={38} y={6} width={24} height={88} rx={12} transform="rotate(60 50 50)" />
        <Rect x={38} y={6} width={24} height={88} rx={12} transform="rotate(120 50 50)" />
      </G>
    </Svg>
  );
}

/** A shiny ball. */
export function Orb({ size = 64, colors = ['#EFEAFF', '#A996FF', '#6A52E0'] }: { size?: number; colors?: string[] }) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <Defs>
        <RadialGradient id={id} cx="34%" cy="30%" r="75%">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="0.55" stopColor={colors[1]} />
          <Stop offset="1" stopColor={colors[2]} />
        </RadialGradient>
      </Defs>
      <Circle cx={50} cy={50} r={50} fill={`url(#${id})`} />
    </Svg>
  );
}

/** A pale ring, like a ribbon curling out of the corner. */
export function Ring({ size = 70 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <Defs>
        <RadialGradient id={id} cx="30%" cy="25%" r="90%">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.6" stopColor="#C4CDFF" />
          <Stop offset="1" stopColor="#8E9DF5" />
        </RadialGradient>
      </Defs>
      <Circle cx={50} cy={50} r={36} fill="none" stroke={`url(#${id})`} strokeWidth={22} />
    </Svg>
  );
}
