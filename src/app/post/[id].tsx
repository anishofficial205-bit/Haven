import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { PostCard } from '@/components/PostCard';
import { PostMenu, type MenuTarget } from '@/components/PostMenu';
import { ReplyCard } from '@/components/ReplyCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { REPLY_MAX, useCreateReply, usePost, useReplies, type ReplyKind } from '@/lib/posts';
import { useBlockScreenshots } from '@/lib/privacy';
import { radii, spacing, typography } from '@/theme';

const KINDS: ReplyKind[] = ['solidarity', 'advice'];

export default function PostDetailScreen() {
  useBlockScreenshots();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = usePost(id);
  const replies = useReplies(id);
  const createReply = useCreateReply(id);

  const [menu, setMenu] = useState<MenuTarget | null>(null);
  const [kind, setKind] = useState<ReplyKind>('solidarity');
  const [body, setBody] = useState('');
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);

  const onSend = () => {
    setNotice(null);
    createReply.mutate(
      { kind, body },
      {
        onSuccess: () => {
          setBody('');
          setNotice({ text: strings.replies.pending, isError: false });
        },
        onError: (error) =>
          setNotice({
            text: error.message === 'banned' ? strings.composer.banned : strings.common.genericError,
            isError: true,
          }),
      },
    );
  };

  const card = post.data;
  const canReply = card?.status === 'published';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={strings.confess.title} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {card ? (
          <PostCard
            post={card}
            detail
            onMenu={() =>
              setMenu({ targetType: 'post', id: card.id, isMine: card.is_mine, isSaved: card.is_saved })
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

      {canReply ? (
        <View
          style={[
            styles.composer,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}>
          <View style={styles.kindRow} accessibilityRole="radiogroup" accessibilityLabel={strings.replies.kindLabel}>
            {KINDS.map((option) => (
              <Chip
                key={option}
                role="radio"
                label={strings.replies.kinds[option]}
                selected={kind === option}
                onPress={() => setKind(option)}
              />
            ))}
            <AppText variant="caption" color={theme.textSecondary} style={styles.replyingAs}>
              {strings.replies.replyingAs}
            </AppText>
          </View>
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={REPLY_MAX}
            placeholder={strings.replies.placeholder[kind]}
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel={strings.replies.placeholder[kind]}
            style={[
              styles.input,
              typography.body,
              { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
            ]}
          />
          <AppText
            variant="caption"
            color={notice?.isError ? theme.danger : theme.textSecondary}
            accessibilityLiveRegion="polite">
            {notice?.text ?? strings.replies.reviewNote}
          </AppText>
          <Button
            label={strings.replies.send}
            disabled={body.trim().length === 0}
            loading={createReply.isPending}
            onPress={onSend}
          />
        </View>
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
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  kindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  replyingAs: {
    flex: 1,
    textAlign: 'right',
  },
  input: {
    minHeight: 64,
    maxHeight: 140,
    borderWidth: 1.5,
    borderRadius: radii.chip + 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as object,
});
