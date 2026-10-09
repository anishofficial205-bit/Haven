import { Ellipsis } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AnonymousAvatar } from '@/components/AnonymousAvatar';
import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { ReactionBar } from '@/components/ReactionBar';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import type { ReplyCard as Reply } from '@/lib/posts';
import { timeAgo } from '@/lib/time';
import { minTapSize, radii, spacing } from '@/theme';

type Props = {
  reply: Reply;
  onMenu: () => void;
};

export function ReplyCard({ reply, onMenu }: Props) {
  const theme = useTheme();
  const waiting = reply.status === 'pending';
  const removed = reply.status === 'rejected' || reply.status === 'hidden';
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: reply.highlighted ? theme.primary : theme.border },
      ]}>
      <View style={styles.top}>
        <AnonymousAvatar size={28} />
        <View style={styles.flex}>
          <AppText variant="label">{strings.post.anonymous}</AppText>
          <AppText variant="caption" color={theme.textSecondary}>
            {timeAgo(reply.created_at)}
          </AppText>
        </View>
        {reply.highlighted ? <Chip label={strings.replies.highlighted} /> : null}
        <Chip label={strings.replies.kinds[reply.kind]} />
        <Pressable
          onPress={onMenu}
          accessibilityRole="button"
          accessibilityLabel={strings.post.moreOptions}
          style={styles.menu}>
          <Ellipsis size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <AppText>{reply.body}</AppText>

      {waiting || removed ? (
        <View style={[styles.status, { backgroundColor: theme.surfaceAlt }]}>
          <AppText variant="label" color={theme.textSecondary}>
            {waiting ? strings.replies.waiting : strings.replies.rejected}
          </AppText>
        </View>
      ) : (
        <ReactionBar targetType="reply" id={reply.id} counts={reply.reaction_counts} mine={reply.my_reaction} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: spacing.sm,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  menu: {
    width: minTapSize,
    height: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
  status: {
    borderRadius: radii.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
});
