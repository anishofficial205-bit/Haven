import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useAuth } from '@/lib/auth';
import {
  HELP_MESSAGE_MAX,
  REQUEST_STATUSES,
  useHelpMessages,
  useRequest,
  useSendHelpMessage,
  useSetRequestStatus,
} from '@/lib/help';
import { useHelpInbox } from '@/lib/mod';
import { useBlockScreenshots } from '@/lib/privacy';
import { timeAgo } from '@/lib/time';
import { radii, spacing, typography } from '@/theme';

const copy = strings.help;

/**
 * One help request as a simple message thread. The person who sent it sees
 * their side; a moderator answering on the professional's behalf sees the
 * same thread plus the status controls. Neither side sees a real identity.
 */
export default function RequestThreadScreen() {
  useBlockScreenshots();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const request = useRequest(id).data;
  const messages = useHelpMessages(id);
  const send = useSendHelpMessage(id);
  const setStatus = useSetRequestStatus(id);
  const [body, setBody] = useState('');

  const isOwner = request?.user_id === profile?.id;
  const isStaff = !isOwner && profile?.role === 'moderator';
  const mySide = isOwner ? 'user' : 'staff';
  // Staff see the anonymous username the request came from, and nothing more.
  const fromUsername = useHelpInbox(isStaff).data?.find((item) => item.id === id)?.username;

  const bubble = (key: string, sender: 'user' | 'staff', text: string, when: string) => {
    const mine = sender === mySide;
    return (
      <View key={key} style={[styles.bubbleRow, mine && styles.mine]}>
        <View
          style={[
            styles.bubble,
            mine
              ? { backgroundColor: theme.blocks.blue, borderBottomRightRadius: 4 }
              : { backgroundColor: theme.surfaceAlt, borderBottomLeftRadius: 4 },
          ]}>
          <AppText variant="caption" color={mine ? theme.ink : theme.textSecondary}>
            {sender === 'user' ? (isOwner ? copy.you : (fromUsername ?? strings.post.anonymous)) : copy.staff} ·{' '}
            {timeAgo(when)}
          </AppText>
          <AppText color={mine ? theme.ink : theme.text}>{text}</AppText>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={copy.threadTitle} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {request ? (
          <>
            <View style={styles.block}>
              <AppText variant="bodyStrong">{copy.to(request.professionals?.name ?? '')}</AppText>
              <AppText variant="label" color={theme.textSecondary}>
                {request.topic} · {copy.prefers(request.language, request.time_window)}
              </AppText>
              <View style={styles.chips}>
                <Chip label={copy.statuses[request.status]} />
              </View>
            </View>

            {isStaff ? (
              <View style={styles.block}>
                <AppText variant="label" color={theme.textSecondary}>
                  {copy.setStatus}
                </AppText>
                <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={copy.setStatus}>
                  {REQUEST_STATUSES.map((status) => (
                    <Chip
                      key={status}
                      role="radio"
                      label={copy.statuses[status]}
                      selected={request.status === status}
                      onPress={() => setStatus.mutate(status)}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {bubble('first', 'user', request.message, request.created_at)}
            {messages.data?.map((message) =>
              bubble(message.id, message.sender, message.body, message.created_at),
            )}
          </>
        ) : null}
      </ScrollView>

      {request && request.status !== 'closed' ? (
        <View
          style={[
            styles.composer,
            { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: insets.bottom + spacing.md },
          ]}>
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={HELP_MESSAGE_MAX}
            placeholder={copy.messagePlaceholder}
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel={copy.messagePlaceholder}
            style={[
              styles.input,
              typography.body,
              { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
            ]}
          />
          {send.isError ? (
            <AppText variant="caption" color={theme.danger} accessibilityLiveRegion="polite">
              {strings.common.genericError}
            </AppText>
          ) : null}
          <Button
            label={copy.send}
            disabled={body.trim().length === 0}
            loading={send.isPending}
            onPress={() => send.mutate(body, { onSuccess: () => setBody('') })}
          />
        </View>
      ) : request ? (
        <AppText
          color={theme.textSecondary}
          style={[styles.closed, { paddingBottom: insets.bottom + spacing.lg }]}>
          {copy.closedNote}
        </AppText>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  block: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    paddingRight: spacing.xxl,
  },
  mine: {
    justifyContent: 'flex-end',
    paddingRight: 0,
    paddingLeft: spacing.xxl,
  },
  bubble: {
    borderRadius: radii.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 2,
    flexShrink: 1,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  input: {
    minHeight: 56,
    maxHeight: 140,
    borderWidth: 1.5,
    borderRadius: radii.chip + 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as object,
  closed: {
    textAlign: 'center',
    padding: spacing.lg,
  },
});
