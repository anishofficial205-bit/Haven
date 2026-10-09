import { Star } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar, avatarOf } from '@/components/Avatar';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing } from '@/theme';

type Stat = { label: string; value: number | string };

type Props = {
  username: string;
  avatarId: number;
  /** Moderators get a star on their card */
  starred?: boolean;
  stats: Stat[];
  /** A line under the card, e.g. "Only you can see this page." */
  footnote?: string;
};

/**
 * The profile as a collectible card: name banner, the character in a frame,
 * and a row of numbers. The card takes its colour from the chosen avatar.
 * It is only ever shown to the person it belongs to.
 */
export function ProfileCard({ username, avatarId, starred, stats, footnote }: Props) {
  const theme = useTheme();
  const avatar = avatarOf(avatarId);
  // Long usernames shrink to stay on one line, like the name banner on a trading card.
  const size = Math.max(17, Math.min(34, Math.floor(330 / Math.max(username.length, 1))));
  const nameSize = { fontSize: size, lineHeight: size * 1.15 };
  return (
    <View style={[styles.card, { backgroundColor: avatar.card, borderColor: theme.ink }]}>
      <View style={styles.banner}>
        <AppText variant="display" color={theme.ink} numberOfLines={1} style={[styles.name, nameSize]}>
          {username}
        </AppText>
        {starred ? <Star size={22} color={theme.ink} fill={theme.ink} /> : null}
      </View>

      <View style={[styles.frame, { borderColor: theme.ink }]}>
        <Avatar id={avatarId} size={150} bare />
      </View>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label} style={[styles.stat, { borderColor: theme.ink }]}>
            <AppText variant="heading" color={theme.ink}>
              {stat.value}
            </AppText>
            <AppText variant="caption" color={theme.ink}>
              {stat.label}
            </AppText>
          </View>
        ))}
      </View>

      {footnote ? (
        <AppText variant="script" color={theme.ink} style={styles.footnote}>
          {footnote}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 3,
    padding: spacing.md,
    gap: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  name: {
    flex: 1,
    textTransform: 'uppercase',
  },
  frame: {
    borderWidth: 3,
    borderRadius: radii.chip + 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    borderWidth: 2.5,
    borderRadius: radii.chip,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  footnote: {
    textAlign: 'center',
  },
});
