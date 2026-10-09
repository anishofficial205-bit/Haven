import { router, useLocalSearchParams } from 'expo-router';
import { EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { HELP_MESSAGE_MAX, useCreateRequest, useProfessional } from '@/lib/help';
import { useBlockScreenshots } from '@/lib/privacy';
import { radii, spacing, typography } from '@/theme';

const copy = strings.help.form;

/** The anonymous request form. No payment, no contact details, text only. */
export default function RequestFormScreen() {
  useBlockScreenshots();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const professional = useProfessional(id).data;
  const create = useCreateRequest();

  const [topic, setTopic] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState<string>(copy.languageOptions[0]);
  const [timeWindow, setTimeWindow] = useState<string>(copy.timeOptions[3]);
  const [sent, setSent] = useState(false);

  const footer = (children: React.ReactNode) => (
    <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>{children}</View>
  );

  if (sent) {
    return (
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        <ScreenHeader title={copy.title} />
        <View style={styles.content}>
          <AppText variant="title" accessibilityRole="header">
            {copy.sentTitle}
          </AppText>
          <AppText color={theme.textSecondary}>{copy.sentBody}</AppText>
        </View>
        <View style={styles.flex} />
        {footer(<Button label={copy.viewRequests} onPress={() => router.replace('/help/requests')} />)}
      </View>
    );
  }

  const picker = (label: string, options: readonly string[], value: string | null, onPick: (v: string) => void) => (
    <View style={styles.block}>
      <AppText variant="bodyStrong">{label}</AppText>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => (
          <Chip key={option} role="radio" label={option} selected={value === option} onPress={() => onPick(option)} />
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={copy.title} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.notice, { backgroundColor: theme.surfaceAlt }]}>
          <EyeOff size={18} color={theme.primary} />
          <AppText variant="label" color={theme.primary} style={styles.flex}>
            {copy.seenLine}
          </AppText>
        </View>
        {professional ? (
          <AppText variant="bodyStrong">{strings.help.to(professional.name)}</AppText>
        ) : null}

        {picker(copy.topicLabel, copy.topics, topic, setTopic)}

        <View style={styles.block}>
          <AppText variant="bodyStrong">{copy.messageLabel}</AppText>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={HELP_MESSAGE_MAX}
            placeholder={copy.messagePlaceholder}
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel={copy.messageLabel}
            style={[
              styles.input,
              typography.body,
              { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          />
          <AppText variant="caption" color={theme.textSecondary} style={styles.counter}>
            {strings.composer.counter(message.length, HELP_MESSAGE_MAX)}
          </AppText>
        </View>

        {picker(copy.languageLabel, copy.languageOptions, language, setLanguage)}
        {picker(copy.timeLabel, copy.timeOptions, timeWindow, setTimeWindow)}
        <AppText variant="label" color={theme.textSecondary}>
          {copy.mode}
        </AppText>
      </ScrollView>
      {footer(
        <>
          {create.isError ? (
            <AppText variant="label" color={theme.danger} accessibilityLiveRegion="polite">
              {strings.common.genericError}
            </AppText>
          ) : null}
          <Button
            label={copy.send}
            disabled={!professional || !topic || message.trim().length === 0}
            loading={create.isPending}
            onPress={() =>
              create.mutate(
                { professional: professional!, topic: topic!, message, language, timeWindow },
                { onSuccess: () => setSent(true) },
              )
            }
          />
        </>,
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  block: {
    gap: spacing.sm,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.chip + 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  input: {
    minHeight: 140,
    borderWidth: 1.5,
    borderRadius: radii.card,
    padding: spacing.lg,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as object,
  counter: {
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});
