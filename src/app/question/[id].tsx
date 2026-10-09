import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PostMenu, type MenuTarget } from '@/components/PostMenu';
import { ReplyCard } from '@/components/ReplyCard';
import { ReplyComposer } from '@/components/ReplyComposer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Tile } from '@/components/Tile';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useCreateQuestionReply, useQuestionReplies, useSpaces, useWeeklyQuestions } from '@/lib/spaces';
import { spacing } from '@/theme';

const copy = strings.spaces;

/** A weekly question and its answers. Highlighted answers come first. */
export default function QuestionScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const questions = useWeeklyQuestions();
  const spaces = useSpaces();
  const replies = useQuestionReplies(id);
  const createReply = useCreateQuestionReply(id);
  const [menu, setMenu] = useState<MenuTarget | null>(null);

  const question = Object.values(questions.data ?? {}).find((item) => item.id === id);
  const space = spaces.data?.find((item) => item.id === question?.space_id);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={copy.questionScreen} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {question ? (
          <Tile tone="pink">
            {space ? (
              <AppText variant="label" color={theme.ink}>
                {space.name}
              </AppText>
            ) : null}
            <AppText variant="display" color={theme.ink} accessibilityRole="header">
              {question.question}
            </AppText>
          </Tile>
        ) : questions.isPending ? null : (
          <AppText color={theme.textSecondary}>{strings.post.notFound}</AppText>
        )}

        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {copy.answersTitle}
          </AppText>
          {replies.data?.length === 0 ? (
            <AppText color={theme.textSecondary}>{copy.noAnswers}</AppText>
          ) : null}
          {replies.data?.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              onMenu={() =>
                setMenu({
                  targetType: 'reply',
                  id: reply.id,
                  isMine: reply.is_mine,
                  highlighted: reply.status === 'approved' ? reply.highlighted : undefined,
                })
              }
            />
          ))}
        </View>
      </ScrollView>

      {question ? (
        <ReplyComposer
          placeholder={copy.answerPlaceholder}
          onSend={(reply) => createReply.mutateAsync(reply)}
          sending={createReply.isPending}
        />
      ) : null}
      <PostMenu target={menu} onClose={() => setMenu(null)} />
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
});
