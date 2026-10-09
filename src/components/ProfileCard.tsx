import { StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Frame, Stats, Strip, type Stat } from '@/components/Collector';
import { Tile } from '@/components/Tile';
import { strings } from '@/i18n/en';
import { spacing, type BlockTone } from '@/theme';

type Props = {
  username: string;
  avatarId: number;
  /** Moderators get three stars on their card */
  starred?: boolean;
  stats: Stat[];
  /** A line under the card, e.g. "Only you can see this page." */
  footnote?: string;
};

const TONES: BlockTone[] = ['mint', 'lime', 'rose', 'sky'];

/**
 * The profile as a collectible card: a typed strip, the character in a
 * framed window, a brush-lettered name and a row of numbers. The card's
 * colour follows the chosen avatar. Only its owner ever sees it.
 */
export function ProfileCard({ username, avatarId, starred, stats, footnote }: Props) {
  // Long usernames shrink to stay on one line.
  const size = Math.max(18, Math.min(30, Math.floor(300 / Math.max(username.length, 1))));
  return (
    <Tile tone={TONES[(avatarId - 1) % TONES.length]}>
      <Strip
        left={`${strings.profile.cardLabel} · No.${String(avatarId).padStart(3, '0')}`}
        stars={starred ? 3 : 1}
      />
      <Frame style={styles.frame}>
        <Avatar id={avatarId} size={132} bare />
        <AppText
          variant="display"
          numberOfLines={1}
          style={[styles.name, { fontSize: size, lineHeight: size * 1.2 }]}>
          {username}
        </AppText>
      </Frame>
      <Stats items={stats} />
      {footnote ? (
        <AppText variant="strip" style={styles.footnote}>
          {footnote.toUpperCase()}
        </AppText>
      ) : null}
    </Tile>
  );
}

const styles = StyleSheet.create({
  frame: {
    flexDirection: 'column',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  name: {
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  footnote: {
    textAlign: 'center',
  },
});
