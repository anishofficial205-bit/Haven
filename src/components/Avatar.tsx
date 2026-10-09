import { useId } from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

/**
 * The 12 preset avatars: glossy little characters, drawn in code so they stay
 * sharp at any size. Placeholder artwork until an illustrated set is ready:
 * swap the drawing here and nothing else changes.
 * Avatar ids are 1-based and stored in the database, so keep the order.
 */
type Shape = "blob" | "circle" | "drop" | "ghost" | "square" | "flower";
type Mouth = "smile" | "flat" | "oh" | "grin";

/** [highlight, body, shade] */
const AVATARS: {
  shape: Shape;
  colors: [string, string, string];
  mouth: Mouth;
  look: number;
}[] = [
  {
    shape: "blob",
    colors: ["#FFF3A8", "#E8FF2A", "#9FBF00"],
    mouth: "smile",
    look: 2,
  },
  {
    shape: "circle",
    colors: ["#FFD9F0", "#FF7AC3", "#B81469"],
    mouth: "grin",
    look: -2,
  },
  {
    shape: "drop",
    colors: ["#D9FFF0", "#54D6A0", "#17876A"],
    mouth: "oh",
    look: 0,
  },
  {
    shape: "ghost",
    colors: ["#FFFFFF", "#D9DCFF", "#8E9DF5"],
    mouth: "flat",
    look: 2,
  },
  {
    shape: "square",
    colors: ["#E3DCFF", "#A996FF", "#5B3BD6"],
    mouth: "smile",
    look: -2,
  },
  {
    shape: "flower",
    colors: ["#FFE9BF", "#FFB24A", "#CF5A12"],
    mouth: "grin",
    look: 0,
  },
  {
    shape: "circle",
    colors: ["#D6DEFF", "#8EA2FF", "#3148C8"],
    mouth: "oh",
    look: 2,
  },
  {
    shape: "blob",
    colors: ["#FFD9F0", "#FF8FCD", "#B81469"],
    mouth: "flat",
    look: -2,
  },
  {
    shape: "drop",
    colors: ["#FFE9BF", "#FFB24A", "#CF5A12"],
    mouth: "smile",
    look: 2,
  },
  {
    shape: "square",
    colors: ["#D9FFF0", "#7BE3B5", "#17876A"],
    mouth: "grin",
    look: 0,
  },
  {
    shape: "ghost",
    colors: ["#FFF3A8", "#E8FF2A", "#9FBF00"],
    mouth: "oh",
    look: -2,
  },
  {
    shape: "flower",
    colors: ["#E3DCFF", "#B9A0FF", "#6A3FE0"],
    mouth: "smile",
    look: 2,
  },
];

const INK = "#0C0C0C";
const PETALS = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 6;
  return { cx: 50 + 23 * Math.cos(angle), cy: 52 + 23 * Math.sin(angle) };
});

function Body({ shape, fill }: { shape: Shape; fill: string }) {
  switch (shape) {
    case "circle":
      return <Circle cx={50} cy={52} r={40} fill={fill} />;
    case "square":
      return <Rect x={11} y={13} width={78} height={78} rx={26} fill={fill} />;
    case "drop":
      return (
        <Path
          d="M50 6 C74 30 90 48 90 60 A40 40 0 0 1 10 60 C10 48 26 30 50 6 Z"
          fill={fill}
        />
      );
    case "ghost":
      return (
        <Path
          d="M14 92 V46 A36 36 0 0 1 86 46 V92 L72 80 L58 92 L44 80 L30 92 Z"
          fill={fill}
        />
      );
    case "flower":
      return (
        <G fill={fill}>
          {PETALS.map((petal) => (
            <Circle key={petal.cx} {...petal} r={19} />
          ))}
          <Circle cx={50} cy={52} r={26} />
        </G>
      );
    default:
      return (
        <Path
          d="M18 60 C4 38 24 12 48 18 C72 6 98 28 88 52 C98 76 74 96 52 86 C32 96 8 82 18 60 Z"
          fill={fill}
        />
      );
  }
}

type Props = {
  /** 1 to 12 */
  id: number;
  size?: number;
};

export function Avatar({ id, size = 56 }: Props) {
  const gradient = useId().replace(/:/g, "");
  const avatar = AVATARS[id - 1] ?? AVATARS[0];
  const [light, mid, shade] = avatar.colors;
  // Wrapped in a View so it layers correctly above a glow behind it.
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={gradient} cx="32%" cy="24%" r="85%">
            <Stop offset="0" stopColor={light} />
            <Stop offset="0.5" stopColor={mid} />
            <Stop offset="1" stopColor={shade} />
          </RadialGradient>
        </Defs>
        <Body shape={avatar.shape} fill={`url(#${gradient})`} />
        {/* eyes: white, with pupils looking slightly to one side */}
        <Circle cx={38} cy={47} r={10.5} fill="#FFFFFF" />
        <Circle cx={62} cy={47} r={10.5} fill="#FFFFFF" />
        <Circle cx={38 + avatar.look} cy={48} r={5.2} fill={INK} />
        <Circle cx={62 + avatar.look} cy={48} r={5.2} fill={INK} />
        {avatar.mouth === "smile" ? (
          <Path
            d="M41 64 Q50 73 59 64"
            stroke={INK}
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
        ) : null}
        {avatar.mouth === "flat" ? (
          <Rect x={43} y={64} width={14} height={5} rx={2.5} fill={INK} />
        ) : null}
        {avatar.mouth === "oh" ? (
          <Ellipse cx={50} cy={67} rx={5} ry={5.5} fill={INK} />
        ) : null}
        {avatar.mouth === "grin" ? (
          <Path d="M40 62 H60 Q58 75 50 75 Q42 75 40 62 Z" fill={INK} />
        ) : null}
      </Svg>
    </View>
  );
}
