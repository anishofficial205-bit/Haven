import Svg, { Path } from 'react-native-svg';

type Props = {
  size: number;
  /** Fill colour. Leave out for an outline-only star. */
  fill?: string;
  stroke?: string;
  points?: number;
  /** How deep the spikes cut in: 0.1 is very spiky, 0.6 is chunky */
  inner?: number;
};

/** A spiky star, used as decoration. Purely visual: hidden from screen readers. */
export function Starburst({ size, fill, stroke, points = 10, inner = 0.18 }: Props) {
  const steps = points * 2;
  const path =
    Array.from({ length: steps }, (_, i) => {
      const radius = i % 2 === 0 ? 48 : 48 * inner;
      const angle = (Math.PI * 2 * i) / steps - Math.PI / 2;
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ') + ' Z';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <Path d={path} fill={fill ?? 'none'} stroke={stroke} strokeWidth={stroke ? 1.2 : 0} strokeLinejoin="miter" />
    </Svg>
  );
}
