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
import { looksLikePersonalInfo } from '@/lib/moderation';
import { goBack } from '@/lib/nav';
import {
  CONFESSION_MAX,
  SPACE_POST_MAX,
  TAGS,
  TRIGGER_WARNINGS,
  useCreateConfession,
  type PostCard as Post,
  type PostResult,
  type Tag,
  type TriggerWarning,
} from '@/lib/posts';
import { POST_TYPES, useCreateSpacePost, type PostType } from '@/lib/spaces';
import { radii, spacing, typography } from '@/theme';

const copy = strings.composer;
const MAX_TAGS = 3;

/**
 * Write, preview exactly as others will see it, then post.
 * Opened with a spaceId it writes a space post; otherwise a confession.
 */
export default function ComposeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // "Talk about it" from a scenario arrives with a tag already chosen.
  const params = useLocalSearchParams<{ tag?: Tag; spaceId?: string }>();
  const spaceId = params.spaceId;
  const createConfession = useCreateConfession();
  const createSpacePost = useCreateSpacePost();
  const sending = createConfession.isPending || createSpacePost.isPending;
  const maxLength = spaceId ? SPACE_POST_MAX : CONFESSION_MAX;
  const screenTitle = spaceId ? strings.spaces.composerTitle : copy.title;
  const [postType, setPostType] = useState<PostType>('story');

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

  // Confessions need at least one tag; in a space they are optional.
  const canPreview = body.trim().length > 0 && (spaceId ? true : tags.length >= 1);

  const onPost = () => {
    setError(null);
    const handlers = {
      onSuccess: setResult,
      onError: (failure: Error) =>
        setError(failure.message === 'banned' ? copy.banned : strings.common.genericError),
    };
    if (spaceId) {
      createSpacePost.mutate({ spaceId, postType, body, tags, triggerWarnings: warnings }, handlers);
    } else {
      createConfession.mutate({ body, tags, triggerWarnings: warnings }, handlers);
    }
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
        <ScreenHeader title={screenTitle} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.block}>
            <AppText variant="title" accessibilityRole="header">
              {selfHarm ? copy.selfHarmTitle : live ? copy.doneLiveTitle : copy.donePendingTitle}
            </AppText>
            {selfHarm ? <AppText color={theme.textSecondary}>{copy.selfHarmBody}</AppText> : null}
            <AppText color={theme.textSecondary}>
              {live ? (spaceId ? strings.spaces.doneLive : copy.doneLive) : copy.donePending}
            </AppText>
          </View>
          {selfHarm ? <HelplineList /> : null}
        </ScrollView>
        {footer(
          <>
            <Button label={spaceId ? strings.common.back : copy.backToFeed} onPress={() => goBack('/compose')} />
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
      kind: spaceId ? 'space_post' : 'confession',
      space_id: spaceId ?? null,
      post_type: spaceId ? postType : null,
      body: body.trim(),
      tags,
      trigger_warnings: warnings,
      status: 'published',
      moderation_reason: null,
      featured_on: null,
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
          {looksLikePersonalInfo(body) ? (
            <View style={[styles.postingAs, { backgroundColor: theme.surfaceAlt }]}>
              <AppText variant="label" color={theme.warning} style={styles.flex}>
                {copy.personalInfoNotice}
              </AppText>
            </View>
          ) : null}
          {postingAs}
        </ScrollView>
        {footer(
          <>
            {error ? (
              <AppText variant="label" color={theme.danger} accessibilityLiveRegion="polite">
                {error}
              </AppText>
            ) : null}
            <Button label={copy.post} loading={sending} onPress={onPost} />
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
      <ScreenHeader title={screenTitle} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {postingAs}

        {spaceId ? (
          <View style={styles.block}>
            <AppText variant="bodyStrong">{strings.spaces.typeLabel}</AppText>
            <View style={styles.chips} accessibilityRole="radiogroup">
              {POST_TYPES.map((option) => (
                <Chip
                  key={option}
                  role="radio"
                  label={strings.spaces.postTypes[option]}
                  selected={postType === option}
                  onPress={() => setPostType(option)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.block}>
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={maxLength}
            placeholder={spaceId ? strings.spaces.placeholder : copy.placeholder}
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel={spaceId ? strings.spaces.bodyLabel : copy.bodyLabel}
            style={[
              styles.input,
              typography.body,
              { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          />
          <AppText variant="caption" color={theme.textSecondary} style={styles.counter}>
            {copy.counter(body.length, maxLength)}
          </AppText>
        </View>

        <View style={styles.block}>
          <AppText variant="bodyStrong">{copy.tagsLabel}</AppText>
          <AppText variant="label" color={theme.textSecondary}>
            {spaceId ? strings.spaces.tagsHelp : copy.tagsHelp}
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
