import { Ellipsis } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ReactionBar } from '@/components/ReactionBar';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import type { ReplyCard as Reply } from '@/lib/posts';
import { timeAgo } from '@/lib/time';
import { spacing } from '@/theme';

type Props = {
  reply: Reply;
  onMenu: () => void;
};

/** One reply. Its kind (Advice or Solidarity) is a small label; a highlighted answer gets a yellow edge. */
export function ReplyCard({ reply, onMenu }: Props) {
  const theme = useTheme();
  const waiting = reply.status === 'pending';
  const removed = reply.status === 'rejected' || reply.status === 'hidden';
  const meta = [strings.replies.kinds[reply.kind], timeAgo(reply.created_at)].join(' · ');
  return (
    <Card
      style={[
        styles.card,
        (waiting || removed) && { backgroundColor: 'transparent' },
        reply.highlighted && { borderColor: theme.primary, borderWidth: 1.5 },
      ]}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <AppText variant="label" numberOfLines={1}>
            {reply.is_mine ? strings.help.you : strings.post.anonymous}
            <AppText variant="caption" color={theme.textSecondary}>
              {'  '}
              {meta}
            </AppText>
          </AppText>
        </View>
        {reply.highlighted ? <Chip tone="warning" label={strings.replies.highlighted} /> : null}
        {waiting ? <Chip label={strings.replies.waiting} /> : null}
        <Pressable
          onPress={onMenu}
          accessibilityRole="button"
          accessibilityLabel={strings.post.moreOptions}
          hitSlop={10}
          style={styles.menu}>
          <Ellipsis size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      <AppText color={waiting || removed ? '#C9C9D6' : '#F2F2F6'}>{reply.body}</AppText>

      {removed ? (
        <AppText variant="label" color={theme.textSecondary}>
          {strings.replies.rejected}
        </AppText>
      ) : waiting ? null : (
        <ReactionBar targetType="reply" id={reply.id} counts={reply.reaction_counts} mine={reply.my_reaction} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
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
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
