import { Star } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing } from '@/theme';

/**
 * The parts every collectible card is built from. Use them inside a Tile or
 * a Card:
 *
 *   <Strip left="SCENARIO · NO.001" stars={2} />
 *   <Frame> ...character and title... </Frame>
 *   <Stats items={[{ value: '03', label: 'min' }, ...]} />
 */

type StripProps = {
  left: string;
  /** Text on the right. Leave out when showing stars. */
  right?: string;
  /** 0 to 3 filled stars on the right */
  stars?: number;
};

/** The typed line across the top of a card. */
export function Strip({ left, right, stars }: StripProps) {
  const theme = useTheme();
  return (
    <View style={styles.strip}>
      <AppText variant="strip" numberOfLines={1} style={styles.stripLeft}>
        {left.toUpperCase()}
      </AppText>
      {stars !== undefined ? (
        <View style={styles.stars} accessibilityLabel={`${stars} of 3`} accessibilityRole="text">
          {[1, 2, 3].map((n) => (
            <Star key={n} size={11} color={theme.ink} fill={n <= stars ? theme.ink : 'transparent'} />
          ))}
        </View>
      ) : right ? (
        <AppText variant="strip" numberOfLines={1}>
          {right.toUpperCase()}
        </AppText>
      ) : null}
    </View>
  );
}

/** The framed window on a card, where the character and title sit. */
export function Frame({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View style={[styles.frame, { backgroundColor: theme.paper, borderColor: theme.ink }, style]}>{children}</View>
  );
}

export type Stat = { value: string | number; label: string };

/** A row of small boxes with a monospaced number over a label. */
export function Stats({ items }: { items: Stat[] }) {
  const theme = useTheme();
  return (
    <View style={styles.stats}>
      {items.map((item) => (
        <View key={item.label} style={[styles.stat, { borderColor: theme.ink, backgroundColor: theme.surfaceAlt }]}>
          <AppText variant="numeral" style={styles.statValue}>
            {item.value}
          </AppText>
          <AppText variant="caption">{item.label}</AppText>
        </View>
      ))}
    </View>
  );
}

/** A round, tilted badge with a brush-lettered word: "play", "new". */
export function Badge({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: theme.ink, borderColor: theme.blocks.lime }, style]}>
      <AppText variant="script" color={theme.blocks.lime} style={styles.badgeText}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stripLeft: {
    flexShrink: 1,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  frame: {
    borderWidth: 1.25,
    borderRadius: 16,
    borderBottomRightRadius: radii.sharp,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.xs + 1,
  },
  stat: {
    flex: 1,
    borderWidth: 1.25,
    borderRadius: radii.chip + 2,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
  },
  statValue: {
    fontSize: 17,
    lineHeight: 19,
    letterSpacing: -0.6,
  },
  badge: {
    width: 50,
    height: 50,
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '10deg' }],
  },
  badgeText: {
    fontSize: 14,
    lineHeight: 16,
  },
});
