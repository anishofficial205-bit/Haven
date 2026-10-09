import { BicepsFlexed, Eye, Handshake, Heart, HeartHandshake, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { REACTIONS, useReact, type Reaction, type TargetType } from '@/lib/posts';
import { radii, spacing } from '@/theme';

/**
 * Drawn in the app's own line style rather than as system emoji, so they
 * look the same on every phone and sit properly with the rest of the design.
 */
const ICONS: Record<Reaction, LucideIcon> = {
  with_you: Handshake,
  hug: HeartHandshake,
  love: Heart,
  got_this: BicepsFlexed,
  same_here: Eye,
};

type Props = {
  targetType: TargetType;
  id: string;
  counts: Partial<Record<Reaction, number>>;
  mine: Reaction | null;
  /** Spell out each reaction ("Hug") beside its icon */
  showLabels?: boolean;
  /** For the composer preview: looks real, does nothing */
  disabled?: boolean;
};

/** Five supportive reactions. One per person; tap again to take it back. */
export function ReactionBar({ targetType, id, counts, mine, showLabels, disabled }: Props) {
  const theme = useTheme();
  const react = useReact();
  return (
    <View style={styles.row}>
      {REACTIONS.map((key) => {
        const { label } = strings.reactions[key];
        const Icon = ICONS[key];
        const count = counts[key] ?? 0;
        const selected = mine === key;
        return (
          <Pressable
            key={key}
            disabled={disabled}
            onPress={() => react.mutate({ targetType, id, current: mine, emoji: key })}
            accessibilityRole="button"
            accessibilityLabel={strings.reactions.count(label, count)}
            accessibilityState={{ selected }}
            hitSlop={{ top: 5, bottom: 5, left: 2, right: 2 }}
            style={[
              styles.pill,
              {
                backgroundColor: selected ? theme.blocks.lime : 'transparent',
                borderColor: selected ? theme.ink : theme.surfaceAlt,
              },
            ]}>
            <Icon size={17} strokeWidth={2} color={theme.ink} fill={selected && key === 'love' ? theme.ink : 'transparent'} />
            {showLabels ? <AppText variant="label">{label}</AppText> : null}
            {count > 0 ? (
              <AppText variant="strip" style={styles.count}>
                {count}
              </AppText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    height: 34,
    minWidth: 38,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  count: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0,
  },
});
