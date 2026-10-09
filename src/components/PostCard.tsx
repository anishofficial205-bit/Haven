import { Ellipsis, MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AnonymousAvatar } from '@/components/AnonymousAvatar';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Glow } from '@/components/Glow';
import { ReactionBar } from '@/components/ReactionBar';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import type { PostCard as Post } from '@/lib/posts';
import { timeAgo } from '@/lib/time';
import { FEATURE_TONE, radii, spacing } from '@/theme';

type Props = {
  post: Post;
  /** Feed cards shorten long text and open the post when tapped */
  onOpen?: () => void;
  onMenu?: () => void;
  /** The composer preview: looks exactly like the real thing, but nothing is tappable */
  preview?: boolean;
  /** The detail screen spells out the reaction names */
  detail?: boolean;
};

/**
 * One post, for confessions and space posts alike, on a plain dark panel so
 * it is easy to read. It never shows who wrote it: everyone is "Anonymous"
 * with the same avatar.
 */
export function PostCard({ post, onOpen, onMenu, preview, detail }: Props) {
  const theme = useTheme();
  const tone = post.kind === 'space_post' ? FEATURE_TONE.spaces : FEATURE_TONE.confess;
  // Content with trigger warnings stays out of sight until the reader chooses.
  // Authors already know what they wrote.
  const gated = post.trigger_warnings.length > 0 && !post.is_mine;
  const [revealed, setRevealed] = useState(false);
  const hidden = gated && !revealed;

  const status =
    post.status === 'pending' ? strings.post.pending
    : post.status === 'rejected'
      ? post.moderation_reason && post.moderation_reason in strings.guidelines
        ? strings.post.rejectedBecause(strings.guidelines[post.moderation_reason as keyof typeof strings.guidelines])
        : strings.post.rejected
    : post.status === 'hidden' ? strings.post.hidden
    : null;

  const meta = [
    timeAgo(post.created_at),
    post.post_type ? strings.spaces.postTypes[post.post_type] : null,
    post.is_mine ? strings.post.yours : post.is_seed ? strings.post.sample : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card>
      <View style={styles.top}>
        <AnonymousAvatar tone={tone} />
        <View style={styles.flex}>
          <AppText variant="label" numberOfLines={1}>
            {strings.post.anonymous}
            <AppText variant="caption" color={theme.textSecondary}>
              {'  '}
              {meta}
            </AppText>
          </AppText>
        </View>
        {onMenu && !preview ? (
          <Pressable
            onPress={onMenu}
            accessibilityRole="button"
            accessibilityLabel={strings.post.moreOptions}
            hitSlop={10}
            style={styles.menu}>
            <Ellipsis size={20} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {status ? (
        <View style={[styles.status, { backgroundColor: theme.surfaceAlt }]}>
          <AppText variant="label" color={theme.textSecondary}>
            {status}
          </AppText>
        </View>
      ) : null}

      {hidden ? (
        // The real words are not rendered at all until "Show anyway" is tapped.
        <Glow tone={tone} style={styles.gate}>
          <AppText variant="label">{strings.post.warningTitle}</AppText>
          <View style={styles.chips}>
            {post.trigger_warnings.map((warning) => (
              <Chip key={warning} tone="warning" label={strings.triggerWarnings[warning]} />
            ))}
          </View>
          <View style={styles.showRow}>
            <Button variant="secondary" label={strings.post.showAnyway} onPress={() => setRevealed(true)} />
          </View>
        </Glow>
      ) : (
        <>
          {post.trigger_warnings.length > 0 ? (
            <View style={styles.chips}>
              {post.trigger_warnings.map((warning) => (
                <Chip key={warning} tone="warning" label={strings.triggerWarnings[warning]} />
              ))}
            </View>
          ) : null}
          <Pressable
            onPress={onOpen}
            disabled={!onOpen || preview}
            accessibilityRole={onOpen ? 'button' : undefined}
            accessibilityHint={onOpen ? strings.post.openPost : undefined}>
            <AppText color="#F2F2F6" numberOfLines={onOpen ? 6 : undefined}>
              {post.body}
            </AppText>
          </Pressable>
        </>
      )}

      {post.tags.length > 0 ? (
        <View style={styles.chips}>
          {post.tags.map((tag) => (
            <Chip key={tag} label={strings.tags[tag]} />
          ))}
        </View>
      ) : null}

      {post.status === 'published' || preview ? (
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <ReactionBar
            targetType="post"
            id={post.id}
            counts={post.reaction_counts}
            mine={post.my_reaction}
            showLabels={detail}
            disabled={preview}
          />
          {onOpen ? (
            <Pressable
              onPress={onOpen}
              disabled={preview}
              accessibilityRole="button"
              accessibilityLabel={strings.post.replies(post.reply_count)}
              hitSlop={10}
              style={styles.replies}>
              <MessageCircle size={16} color={theme.textSecondary} />
              <AppText variant="label" color={theme.textSecondary}>
                {post.reply_count}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  menu: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    borderRadius: radii.chip + 2,
    padding: spacing.md,
  },
  gate: {
    borderRadius: radii.card - 6,
    gap: spacing.sm + 2,
  },
  showRow: {
    alignSelf: 'flex-start',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    paddingTop: spacing.sm + 2,
  },
  replies: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
