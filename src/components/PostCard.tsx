import { Ellipsis, MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AnonymousAvatar } from '@/components/AnonymousAvatar';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Strip } from '@/components/Collector';
import { ReactionBar } from '@/components/ReactionBar';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import type { PostCard as Post } from '@/lib/posts';
import { timeAgo } from '@/lib/time';
import { radii, spacing } from '@/theme';

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
 * One post, for confessions and space posts alike, as a paper card. It never
 * shows who wrote it: everyone is "Anonymous" with the same avatar.
 */
export function PostCard(props: Props) {
  return (
    <Card>
      <PostBody {...props} />
    </Card>
  );
}

/** The inside of the card. A separate component so it picks up the card's colours. */
function PostBody({ post, onOpen, onMenu, preview, detail }: Props) {
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

  const kind = post.post_type ? strings.spaces.postTypes[post.post_type] : strings.tabs.confess;
  const flag = post.is_mine ? strings.post.yours : post.is_seed ? strings.post.sample : undefined;

  return (
    <>
      <Strip left={`${kind} · ${timeAgo(post.created_at)}`} right={flag} />

      <View style={styles.top}>
        <AnonymousAvatar size={26} />
        <AppText variant="label" style={styles.flex}>
          {strings.post.anonymous}
        </AppText>
        {onMenu && !preview ? (
          <Pressable
            onPress={onMenu}
            accessibilityRole="button"
            accessibilityLabel={strings.post.moreOptions}
            hitSlop={8}
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
        <View style={[styles.gate, { backgroundColor: theme.blocks.rose }]}>
          <AppText variant="label">{strings.post.warningTitle}</AppText>
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
                style={[styles.blurLine, { width: `${width * 100}%`, backgroundColor: theme.ink }]}
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
        <View style={[styles.footer, { borderTopColor: theme.surfaceAlt }]}>
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
              hitSlop={8}
              style={styles.replies}>
              <MessageCircle size={15} color={theme.textSecondary} />
              <AppText variant="label" color={theme.textSecondary}>
                {strings.post.replies(post.reply_count)}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </>
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
  footer: {
    borderTopWidth: 1,
    paddingTop: spacing.sm + 2,
    marginTop: 2,
    gap: spacing.sm,
  },
  status: {
    borderRadius: radii.chip,
    padding: spacing.md,
  },
  gate: {
    borderRadius: radii.chip + 6,
    borderTopRightRadius: radii.sharp,
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
    opacity: 0.18,
  },
  blurLine: {
    height: 12,
    borderRadius: radii.pill,
  },
  replies: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
});
