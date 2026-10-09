import { router, useLocalSearchParams } from 'expo-router';
import { EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { HelplineList } from '@/components/HelplineList';
import { PostCard } from '@/components/PostCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import {
  CONFESSION_MAX,
  TAGS,
  TRIGGER_WARNINGS,
  useCreateConfession,
  type PostCard as Post,
  type PostResult,
  type Tag,
  type TriggerWarning,
} from '@/lib/posts';
import { radii, spacing, typography } from '@/theme';

const copy = strings.composer;
const MAX_TAGS = 3;

/** Write, preview exactly as others will see it, then post. */
export default function ComposeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // "Talk about it" from a scenario arrives with a tag already chosen.
  const params = useLocalSearchParams<{ tag?: Tag }>();
  const create = useCreateConfession();

  const [step, setStep] = useState<'write' | 'preview'>('write');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<Tag[]>(params.tag && TAGS.includes(params.tag) ? [params.tag] : []);
  const [warnings, setWarnings] = useState<TriggerWarning[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PostResult | null>(null);

  const toggleTag = (tag: Tag) =>
    setTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : current.length < MAX_TAGS
          ? [...current, tag]
          : current,
    );
  const toggleWarning = (warning: TriggerWarning) =>
    setWarnings((current) =>
      current.includes(warning) ? current.filter((item) => item !== warning) : [...current, warning],
    );

  const canPreview = body.trim().length > 0 && tags.length >= 1;

  const onPost = () => {
    setError(null);
    create.mutate(
      { body, tags, triggerWarnings: warnings },
      {
        onSuccess: setResult,
        onError: (failure) =>
          setError(failure.message === 'banned' ? copy.banned : strings.common.genericError),
      },
    );
  };

  const footer = (children: React.ReactNode) => (
    <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>{children}</View>
  );

  const postingAs = (
    <View style={[styles.postingAs, { backgroundColor: theme.surfaceAlt }]}>
      <EyeOff size={18} color={theme.primary} />
      <View style={styles.flex}>
        <AppText variant="label" color={theme.primary}>
          {copy.postingAs}
        </AppText>
        <AppText variant="caption" color={theme.textSecondary}>
          {copy.noOneSees}
        </AppText>
      </View>
    </View>
  );

  if (result) {
    const live = result.status === 'published';
    const selfHarm = result.moderation_reason === 'self_harm';
    return (
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        <ScreenHeader title={copy.title} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.block}>
            <AppText variant="title" accessibilityRole="header">
              {selfHarm ? copy.selfHarmTitle : live ? copy.doneLiveTitle : copy.donePendingTitle}
            </AppText>
            {selfHarm ? <AppText color={theme.textSecondary}>{copy.selfHarmBody}</AppText> : null}
            <AppText color={theme.textSecondary}>{live ? copy.doneLive : copy.donePending}</AppText>
          </View>
          {selfHarm ? <HelplineList /> : null}
        </ScrollView>
        {footer(
          <>
            <Button label={copy.backToFeed} onPress={() => router.back()} />
            <Button
              variant="text"
              label={copy.viewPost}
              onPress={() => router.replace({ pathname: '/post/[id]', params: { id: result.id } })}
            />
          </>,
        )}
      </View>
    );
  }

  if (step === 'preview') {
    // What everyone else will see: not marked as yours, and behind the
    // trigger-warning gate if you added any.
    const preview: Post = {
      id: 'preview',
      kind: 'confession',
      space_id: null,
      post_type: null,
      body: body.trim(),
      tags,
      trigger_warnings: warnings,
      status: 'published',
      moderation_reason: null,
      is_seed: false,
      created_at: new Date().toISOString(),
      is_mine: false,
      is_saved: false,
      reaction_counts: {},
      reaction_total: 0,
      my_reaction: null,
      reply_count: 0,
      advice_count: 0,
    };
    return (
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        <ScreenHeader title={copy.preview} />
        <ScrollView contentContainerStyle={styles.content}>
          <AppText variant="bodyStrong">{copy.previewTitle}</AppText>
          <PostCard post={preview} preview />
          {postingAs}
        </ScrollView>
        {footer(
          <>
            {error ? (
              <AppText variant="label" color={theme.danger} accessibilityLiveRegion="polite">
                {error}
              </AppText>
            ) : null}
            <Button label={copy.post} loading={create.isPending} onPress={onPost} />
            <Button variant="text" label={copy.edit} onPress={() => setStep('write')} />
          </>,
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={copy.title} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {postingAs}

        <View style={styles.block}>
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={CONFESSION_MAX}
            placeholder={copy.placeholder}
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel={copy.bodyLabel}
            style={[
              styles.input,
              typography.body,
              { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          />
          <AppText variant="caption" color={theme.textSecondary} style={styles.counter}>
            {copy.counter(body.length, CONFESSION_MAX)}
          </AppText>
        </View>

        <View style={styles.block}>
          <AppText variant="bodyStrong">{copy.tagsLabel}</AppText>
          <AppText variant="label" color={theme.textSecondary}>
            {copy.tagsHelp}
          </AppText>
          <View style={styles.chips}>
            {TAGS.map((tag) => (
              <Chip
                key={tag}
                label={strings.tags[tag]}
                selected={tags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <AppText variant="bodyStrong">{copy.warningsLabel}</AppText>
          <AppText variant="label" color={theme.textSecondary}>
            {copy.warningsHelp}
          </AppText>
          <View style={styles.chips}>
            {TRIGGER_WARNINGS.map((warning) => (
              <Chip
                key={warning}
                tone="warning"
                label={strings.triggerWarnings[warning]}
                selected={warnings.includes(warning)}
                onPress={() => toggleWarning(warning)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      {footer(<Button label={copy.preview} disabled={!canPreview} onPress={() => setStep('preview')} />)}
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
  postingAs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.chip + 4,
  },
  input: {
    minHeight: 160,
    borderWidth: 1.5,
    borderRadius: radii.card,
    padding: spacing.lg,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as object,
  counter: {
    textAlign: 'right',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
});
