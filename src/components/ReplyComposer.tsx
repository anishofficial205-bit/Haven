import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
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
};

/**
 * The reply box under a post or weekly question. Replies are always anonymous
 * and always wait for a moderator.
 */
export function ReplyComposer({ onSend, sending, placeholder }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { openHelp } = usePanic();
  const [kind, setKind] = useState<ReplyKind>('solidarity');
  const [body, setBody] = useState('');
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);
  const hint = placeholder ?? strings.replies.placeholder[kind];

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
        placeholder={hint}
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel={hint}
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
      <Button label={strings.replies.send} disabled={body.trim().length === 0} loading={sending} onPress={send} />
    </View>
  );
}

const styles = StyleSheet.create({
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
