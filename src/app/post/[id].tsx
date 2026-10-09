import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PostCard } from '@/components/PostCard';
import { PostMenu, type MenuTarget } from '@/components/PostMenu';
import { ReplyCard } from '@/components/ReplyCard';
import { ReplyComposer } from '@/components/ReplyComposer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useCreateReply, usePost, useReplies } from '@/lib/posts';
import { useBlockScreenshots } from '@/lib/privacy';
import { spacing } from '@/theme';

/** One post with its replies. Used for confessions and space posts alike. */
export default function PostDetailScreen() {
  useBlockScreenshots();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = usePost(id);
  const replies = useReplies(id);
  const createReply = useCreateReply(id);
  const [menu, setMenu] = useState<MenuTarget | null>(null);

  const card = post.data;
  const title = card?.kind === 'space_post' ? strings.spaces.postTitle : strings.confess.title;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={title} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {card ? (
          <PostCard
            post={card}
            detail
            onMenu={() =>
              setMenu({
                targetType: 'post',
                id: card.id,
                isMine: card.is_mine,
                isSaved: card.is_saved,
                canFeature: card.kind === 'confession' && card.status === 'published',
              })
            }
          />
        ) : post.isPending ? null : (
          <AppText color={theme.textSecondary} style={styles.center}>
            {post.isError ? strings.common.genericError : strings.post.notFound}
          </AppText>
        )}

        {card ? (
          <View style={styles.section}>
            <AppText variant="heading" accessibilityRole="header">
              {strings.replies.title}
            </AppText>
            {replies.data?.length === 0 ? (
              <AppText color={theme.textSecondary}>{strings.replies.empty}</AppText>
            ) : null}
            {replies.data?.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                onMenu={() => setMenu({ targetType: 'reply', id: reply.id, isMine: reply.is_mine })}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      {card?.status === 'published' ? (
        <ReplyComposer onSend={(reply) => createReply.mutateAsync(reply)} sending={createReply.isPending} />
      ) : null}

      <PostMenu target={menu} onClose={() => setMenu(null)} onBlocked={() => router.back()} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  center: {
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
});
