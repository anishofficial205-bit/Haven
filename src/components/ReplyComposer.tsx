import { ArrowUp, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { usePanic } from '@/lib/panic';
import { REPLY_MAX, type ReplyKind } from '@/lib/posts';
import { radii, spacing, typography } from '@/theme';

const KINDS: ReplyKind[] = ['solidarity', 'advice'];

type Props = {
  onSend: (reply: { kind: ReplyKind; body: string }) => Promise<{ moderation_reason: string | null }>;
  sending: boolean;
  /** Overrides the hint inside the text box */
  placeholder?: string;
  /** The post's author answering one reply: shows its words instead of the Support / Advice choice */
  replyingTo?: string;
  onCancelReply?: () => void;
};

/**
 * The reply box under a post or weekly question. Replies are always anonymous
 * and always wait for a moderator.
 */
export function ReplyComposer({ onSend, sending, placeholder, replyingTo, onCancelReply }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { openHelp } = usePanic();
  const [kind, setKind] = useState<ReplyKind>('solidarity');
  const [body, setBody] = useState('');
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);
  const hint = placeholder ?? (replyingTo ? strings.replies.responsePlaceholder : strings.replies.placeholder[kind]);
  const canSend = body.trim().length > 0 && !sending;

  const send = async () => {
    setNotice(null);
    try {
      const result = await onSend({ kind, body });
      setBody('');
      setNotice({ text: strings.replies.pending, isError: false });
      // Wording that suggests the writer is struggling: offer helplines straight away.
      if (result.moderation_reason === 'self_harm') openHelp();
    } catch (error) {
      const banned = (error as { message?: string }).message === 'banned';
      setNotice({ text: banned ? strings.composer.banned : strings.common.genericError, isError: true });
    }
  };

  return (
    <View style={[styles.composer, { backgroundColor: theme.background, paddingBottom: insets.bottom + spacing.md }]}>
      {replyingTo ? (
        <View style={styles.kindRow}>
          <View style={[styles.quote, { borderLeftColor: theme.border }]}>
            <AppText variant="caption" color={theme.textSecondary}>
              {strings.replies.replyingTo}
            </AppText>
            <AppText variant="label" numberOfLines={2}>
              {replyingTo}
            </AppText>
          </View>
          <Pressable
            onPress={onCancelReply}
            accessibilityRole="button"
            accessibilityLabel={strings.replies.cancelReply}
            hitSlop={10}>
            <X size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
      ) : (
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
      )}
      <View style={[styles.field, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={REPLY_MAX}
          placeholder={hint}
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel={hint}
          autoFocus={Boolean(replyingTo)}
          style={[styles.input, typography.body, { color: theme.text }]}
        />
        <Pressable
          onPress={send}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={strings.replies.send}
          style={[styles.send, { backgroundColor: theme.primary, opacity: canSend ? 1 : 0.4 }]}>
          {sending ? <ActivityIndicator color={theme.onPrimary} /> : <ArrowUp size={20} color={theme.onPrimary} />}
        </Pressable>
      </View>
      <AppText
        variant="caption"
        color={notice?.isError ? theme.danger : theme.textSecondary}
        accessibilityLiveRegion="polite">
        {notice?.text ?? strings.replies.reviewNote}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm + 2,
    gap: spacing.sm,
  },
  kindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quote: {
    flex: 1,
    borderLeftWidth: 2,
    paddingLeft: spacing.sm + 2,
  },
  replyingAs: {
    flex: 1,
    textAlign: 'right',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: radii.card + 2,
    paddingLeft: spacing.lg,
    paddingRight: 6,
    paddingVertical: 6,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 120,
    paddingVertical: 7,
    textAlignVertical: 'center',
    outlineStyle: 'none',
  } as object,
  send: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
