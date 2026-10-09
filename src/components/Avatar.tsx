import { View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/**
 * The 12 preset avatars: little blob characters, drawn in code so they stay
 * sharp at any size. Placeholder artwork until the illustrated set is ready:
 * swap the drawing here and nothing else changes.
 * Avatar ids are 1-based and stored in the database, so keep the order.
 */
type Shape = 'circle' | 'square' | 'drop' | 'blob' | 'ghost' | 'flower';
type Eyes = 'dots' | 'big' | 'sleepy' | 'wink';
type Mouth = 'smile' | 'flat' | 'oh' | 'grin';

const INK = '#0B0B0C';

export const AVATARS: { shape: Shape; color: string; card: string; eyes: Eyes; mouth: Mouth }[] = [
  { shape: 'blob', color: '#F4E73A', card: '#F272B4', eyes: 'big', mouth: 'smile' },
  { shape: 'ghost', color: '#FFFFFF', card: '#4F8FFF', eyes: 'dots', mouth: 'oh' },
  { shape: 'circle', color: '#F272B4', card: '#3BDD5E', eyes: 'wink', mouth: 'grin' },
  { shape: 'square', color: '#4F8FFF', card: '#F4E73A', eyes: 'big', mouth: 'flat' },
  { shape: 'flower', color: '#FF8A3D', card: '#B9F6E6', eyes: 'dots', mouth: 'smile' },
  { shape: 'drop', color: '#3BDD5E', card: '#F272B4', eyes: 'sleepy', mouth: 'smile' },
  { shape: 'circle', color: '#B79CFF', card: '#F4E73A', eyes: 'big', mouth: 'oh' },
  { shape: 'blob', color: '#FF8A3D', card: '#4F8FFF', eyes: 'wink', mouth: 'flat' },
  { shape: 'square', color: '#3BDD5E', card: '#FF8A3D', eyes: 'dots', mouth: 'grin' },
  { shape: 'ghost', color: '#F272B4', card: '#F4E73A', eyes: 'sleepy', mouth: 'flat' },
  { shape: 'flower', color: '#F4E73A', card: '#B79CFF', eyes: 'big', mouth: 'grin' },
  { shape: 'drop', color: '#4F8FFF', card: '#3BDD5E', eyes: 'dots', mouth: 'smile' },
];

export function avatarOf(id: number) {
  return AVATARS[id - 1] ?? AVATARS[0];
}

const STROKE = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const };
const PETALS = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 6;
  return { cx: 50 + 22 * Math.cos(angle), cy: 52 + 22 * Math.sin(angle) };
});

function Body({ shape, color }: { shape: Shape; color: string }) {
  switch (shape) {
    case 'circle':
      return <Circle cx={50} cy={52} r={36} fill={color} {...STROKE} />;
    case 'square':
      return <Rect x={15} y={17} width={70} height={70} rx={22} fill={color} {...STROKE} />;
    case 'drop':
      return (
        <Path d="M50 10 C72 32 86 48 86 60 A36 36 0 0 1 14 60 C14 48 28 32 50 10 Z" fill={color} {...STROKE} />
      );
    case 'ghost':
      return (
        <Path
          d="M18 88 V46 A32 32 0 0 1 82 46 V88 L69 77 L56 88 L44 77 L31 88 Z"
          fill={color}
          {...STROKE}
        />
      );
    case 'flower':
      return (
        <G>
          {PETALS.map((petal) => (
            <Circle key={`o${petal.cx}`} {...petal} r={17} fill={color} {...STROKE} />
          ))}
          {/* Drawn again without outlines, to hide the lines where petals overlap */}
          {PETALS.map((petal) => (
            <Circle key={`i${petal.cx}`} {...petal} r={15} fill={color} />
          ))}
          <Circle cx={50} cy={52} r={24} fill={color} />
        </G>
      );
    default:
      return (
        <Path
          d="M22 60 C8 40 26 16 48 21 C70 9 94 30 85 52 C95 73 72 92 52 83 C34 93 13 81 22 60 Z"
          fill={color}
          {...STROKE}
        />
      );
  }
}

function Face({ eyes, mouth }: { eyes: Eyes; mouth: Mouth }) {
  const line = { stroke: INK, strokeWidth: 3.5, strokeLinecap: 'round' as const, fill: 'none' };
  return (
    <G>
      {eyes === 'dots' ? (
        <>
          <Circle cx={39} cy={48} r={4.5} fill={INK} />
          <Circle cx={61} cy={48} r={4.5} fill={INK} />
        </>
      ) : null}
      {eyes === 'big' ? (
        <>
          <Circle cx={38} cy={47} r={9} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
          <Circle cx={62} cy={47} r={9} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
          <Circle cx={40} cy={48} r={3.5} fill={INK} />
          <Circle cx={64} cy={48} r={3.5} fill={INK} />
        </>
      ) : null}
      {eyes === 'sleepy' ? (
        <>
          <Path d="M32 48 Q39 54 46 48" {...line} />
          <Path d="M54 48 Q61 54 68 48" {...line} />
        </>
      ) : null}
      {eyes === 'wink' ? (
        <>
          <Circle cx={39} cy={48} r={4.5} fill={INK} />
          <Path d="M55 49 Q62 43 69 49" {...line} />
        </>
      ) : null}

      {mouth === 'smile' ? <Path d="M41 62 Q50 71 59 62" {...line} /> : null}
      {mouth === 'flat' ? <Path d="M43 65 H57" {...line} /> : null}
      {mouth === 'oh' ? <Circle cx={50} cy={66} r={4.5} fill={INK} /> : null}
      {mouth === 'grin' ? <Path d="M40 61 H60 Q58 73 50 73 Q42 73 40 61 Z" fill={INK} /> : null}
    </G>
  );
}

type Props = {
  /** 1 to 12 */
  id: number;
  size?: number;
  /** Draw only the character, with no coloured circle behind it */
  bare?: boolean;
};

export function Avatar({ id, size = 56, bare }: Props) {
  const avatar = avatarOf(id);
  const character = (
    <Svg width={bare ? size : size * 0.82} height={bare ? size : size * 0.82} viewBox="0 0 100 100">
      <Body shape={avatar.shape} color={avatar.color} />
      <Face eyes={avatar.eyes} mouth={avatar.mouth} />
    </Svg>
  );
  if (bare) return character;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: avatar.card,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {character}
    </View>
  );
}
