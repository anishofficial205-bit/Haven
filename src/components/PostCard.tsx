import { Ellipsis, MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AnonymousAvatar } from '@/components/AnonymousAvatar';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ReactionBar } from '@/components/ReactionBar';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import type { PostCard as Post } from '@/lib/posts';
import { timeAgo } from '@/lib/time';
import { minTapSize, radii, spacing } from '@/theme';

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
 * One post, for confessions and space posts alike. It never shows who wrote
 * it: everyone is "Anonymous" with the same avatar.
 */
export function PostCard({ post, onOpen, onMenu, preview, detail }: Props) {
  const theme = useTheme();
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

  return (
    <Card>
      <View style={styles.top}>
        <AnonymousAvatar />
        <View style={styles.flex}>
          <AppText variant="label">{strings.post.anonymous}</AppText>
          <AppText variant="caption" color={theme.textSecondary}>
            {timeAgo(post.created_at)}
          </AppText>
        </View>
        {post.post_type ? <Chip label={strings.spaces.postTypes[post.post_type]} /> : null}
        {post.is_mine ? <Chip label={strings.post.yours} /> : null}
        {post.is_seed ? <Chip label={strings.post.sample} /> : null}
        {onMenu && !preview ? (
          <Pressable
            onPress={onMenu}
            accessibilityRole="button"
            accessibilityLabel={strings.post.moreOptions}
            style={styles.menu}>
            <Ellipsis size={22} color={theme.textSecondary} />
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
        <View style={[styles.gate, { backgroundColor: theme.surfaceAlt }]}>
          <AppText variant="label" color={theme.textSecondary}>
            {strings.post.warningTitle}
          </AppText>
          <View style={styles.chips}>
            {post.trigger_warnings.map((warning) => (
              <Chip key={warning} tone="warning" label={strings.triggerWarnings[warning]} />
            ))}
          </View>
          {/* Stand-in lines, not the real words: nothing can be read through them. */}
          <View style={styles.blurLines} importantForAccessibility="no-hide-descendants" aria-hidden>
            {[1, 0.92, 0.6].map((width) => (
              <View
                key={width}
                style={[styles.blurLine, { width: `${width * 100}%`, backgroundColor: theme.border }]}
              />
            ))}
          </View>
          <Button variant="secondary" label={strings.post.showAnyway} onPress={() => setRevealed(true)} />
        </View>
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
            <AppText numberOfLines={onOpen ? 6 : undefined}>{post.body}</AppText>
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
        <>
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
              style={styles.replies}>
              <MessageCircle size={18} color={theme.textSecondary} />
              <AppText variant="label" color={theme.textSecondary}>
                {strings.post.replies(post.reply_count)}
              </AppText>
            </Pressable>
          ) : null}
        </>
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
    width: minTapSize,
    height: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
  status: {
    borderRadius: radii.chip,
    padding: spacing.md,
  },
  gate: {
    borderRadius: radii.chip + 4,
    padding: spacing.md,
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  blurLines: {
    gap: spacing.sm,
    opacity: 0.7,
  },
  blurLine: {
    height: 12,
    borderRadius: radii.pill,
  },
  replies: {
    minHeight: minTapSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
});
