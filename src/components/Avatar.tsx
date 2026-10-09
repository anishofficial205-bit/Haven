import {
  Bird,
  Cat,
  Cloud,
  Fish,
  Flower2,
  Leaf,
  Moon,
  Mountain,
  Rabbit,
  Star,
  Sun,
  Turtle,
  type LucideIcon,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { radii } from '@/theme';

/**
 * The 12 preset avatars. Placeholder artwork (an icon on a colour) until the
 * illustrated set is ready: swap the entries here and nothing else changes.
 * Avatar ids are 1-based and stored in the database, so keep the order.
 */
const AVATARS: { icon: LucideIcon; background: string; color: string }[] = [
  { icon: Cat, background: '#E9DDFB', color: '#4B2A9E' },
  { icon: Bird, background: '#D6F5EF', color: '#0B5F58' },
  { icon: Fish, background: '#DCEBFF', color: '#1E4E8C' },
  { icon: Flower2, background: '#FFE0EC', color: '#9C2456' },
  { icon: Leaf, background: '#DFF5D8', color: '#2C6B1F' },
  { icon: Moon, background: '#2A2244', color: '#E9DDFB' },
  { icon: Sun, background: '#FFF0C9', color: '#8A5A00' },
  { icon: Star, background: '#FFE3D1', color: '#9A3D0B' },
  { icon: Cloud, background: '#E3EEF5', color: '#2F5570' },
  { icon: Mountain, background: '#E6E3F0', color: '#3D3566' },
  { icon: Rabbit, background: '#FBE3F4', color: '#86246B' },
  { icon: Turtle, background: '#D9F2E3', color: '#1B6B45' },
];

type Props = {
  /** 1 to 12 */
  id: number;
  size?: number;
};

export function Avatar({ id, size = 56 }: Props) {
  const avatar = AVATARS[id - 1] ?? AVATARS[0];
  const Icon = avatar.icon;
  return (
    <View style={[styles.circle, { width: size, height: size, backgroundColor: avatar.background }]}>
      <Icon size={size * 0.55} color={avatar.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
