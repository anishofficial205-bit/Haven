import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import {
  REJECT_REASONS,
  useHelpInbox,
  useModBan,
  useModQueue,
  useModReview,
  useSetWeeklyQuestion,
  type BanLength,
  type ModItem,
  type ModTab,
} from '@/lib/mod';
import { useSpaces, useWeeklyQuestions, type Space } from '@/lib/spaces';
import { timeAgo } from '@/lib/time';
import { minTapSize, radii, spacing, typography } from '@/theme';

const copy = strings.mod;
type Tab = ModTab | 'requests' | 'tools';
const TABS: Tab[] = ['replies', 'posts', 'reports', 'requests', 'tools'];
const BAN_LENGTHS: BanLength[] = [1, 7, 30, 'permanent'];

const guideline = (key: string) =>
  strings.guidelines[key as keyof typeof strings.guidelines] ?? strings.guidelines.other;

/**
 * Moderator tools. The screen is only linked for moderators, and every action
 * is checked again by the database, so reaching this screen grants nothing.
 */
export default function ModScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<Tab>('replies');

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={copy.title} />
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityRole="radiogroup"
          contentContainerStyle={styles.tabs}>
          {TABS.map((option) => (
            <Chip
              key={option}
              role="radio"
              label={copy.tabs[option]}
              selected={tab === option}
              onPress={() => setTab(option)}
            />
          ))}
        </ScrollView>
      </View>
      {tab === 'requests' ? <Requests /> : tab === 'tools' ? <Tools /> : <Queue key={tab} tab={tab} />}
    </View>
  );
}

function Queue({ tab }: { tab: ModTab }) {
  const theme = useTheme();
  const queue = useModQueue(tab);
  const review = useModReview();
  const ban = useModBan();
  const [rejecting, setRejecting] = useState<ModItem | null>(null);
  const [banning, setBanning] = useState<ModItem | null>(null);

  return (
    <>
      <FlatList
        data={queue.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={queue.isRefetching} onRefresh={queue.refetch} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          queue.isPending ? null : (
            <AppText color={queue.isError ? theme.danger : theme.textSecondary} style={styles.empty}>
              {queue.isError ? strings.common.genericError : copy.empty}
            </AppText>
          )
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.chips}>
              {item.priority ? <Chip tone="warning" label={copy.priority} /> : null}
              <Chip
                label={
                  item.target_type === 'reply'
                    ? strings.replies.kinds[item.kind as 'advice' | 'solidarity' | 'response']
                    : item.kind === 'confession'
                      ? strings.tabs.confess
                      : strings.spaces.postTitle
                }
              />
              {item.is_seed ? <Chip label={strings.post.sample} /> : null}
              <Chip label={timeAgo(item.created_at)} />
            </View>

            {item.moderation_reason ? (
              <AppText variant="label" color={theme.warning}>
                {copy.heldBecause(guideline(item.moderation_reason))}
              </AppText>
            ) : null}
            {item.report_count > 0 ? (
              <AppText variant="label" color={theme.warning}>
                {copy.reportedFor(item.report_count, item.report_reasons.map(guideline).join(', '))}
              </AppText>
            ) : null}

            {item.context ? (
              <View style={[styles.context, { backgroundColor: theme.surfaceAlt }]}>
                <AppText variant="caption" color={theme.textSecondary}>
                  {copy.inReplyTo}
                </AppText>
                <AppText variant="label" color={theme.textSecondary} numberOfLines={4}>
                  {item.context}
                </AppText>
              </View>
            ) : null}

            <AppText>{item.body}</AppText>

            <View style={styles.actions}>
              <View style={styles.flex}>
                <Button
                  label={copy.approve}
                  onPress={() => review.mutate({ item, approve: true })}
                  disabled={review.isPending}
                />
              </View>
              <View style={styles.flex}>
                <Button variant="secondary" label={copy.reject} onPress={() => setRejecting(item)} />
              </View>
            </View>
            {item.is_seed ? null : <Button variant="text" label={copy.ban} onPress={() => setBanning(item)} />}
          </Card>
        )}
      />

      <BottomSheet visible={rejecting !== null} title={copy.reasonTitle} onClose={() => setRejecting(null)}>
        {REJECT_REASONS.map((reason) => (
          <Pressable
            key={reason}
            accessibilityRole="button"
            onPress={() => {
              if (rejecting) review.mutate({ item: rejecting, approve: false, reason });
              setRejecting(null);
            }}
            style={({ pressed }) => [
              styles.option,
              { backgroundColor: pressed ? theme.surfaceAlt : theme.surface },
            ]}>
            <AppText variant="bodyStrong">{copy.rejectReasons[reason]}</AppText>
          </Pressable>
        ))}
      </BottomSheet>

      <BottomSheet visible={banning !== null} title={copy.banTitle} onClose={() => setBanning(null)}>
        <AppText color={theme.textSecondary}>{copy.banBody}</AppText>
        {BAN_LENGTHS.map((length) => (
          <Pressable
            key={length}
            accessibilityRole="button"
            onPress={() => {
              if (banning) ban.mutate({ item: banning, length });
              setBanning(null);
            }}
            style={({ pressed }) => [
              styles.option,
              { backgroundColor: pressed ? theme.surfaceAlt : theme.surface },
            ]}>
            <AppText variant="bodyStrong" color={length === 'permanent' ? theme.danger : theme.text}>
              {copy.banOptions[length]}
            </AppText>
          </Pressable>
        ))}
      </BottomSheet>
    </>
  );
}

/** Help requests, answered here on the professional's behalf in this version. */
function Requests() {
  const theme = useTheme();
  const inbox = useHelpInbox();
  return (
    <FlatList
      data={inbox.data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={inbox.isRefetching} onRefresh={inbox.refetch} tintColor={theme.primary} />
      }
      ListEmptyComponent={
        inbox.isPending ? null : (
          <AppText color={theme.textSecondary} style={styles.empty}>
            {inbox.isError ? strings.common.genericError : copy.noRequests}
          </AppText>
        )
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/help/requests/[id]', params: { id: item.id } })}>
          <Card>
            <View style={styles.chips}>
              <Chip label={strings.help.statuses[item.status as keyof typeof strings.help.statuses]} />
              <Chip label={item.topic} />
              <Chip label={timeAgo(item.created_at)} />
            </View>
            <AppText variant="bodyStrong">{strings.help.from(item.username)}</AppText>
            <AppText variant="label" color={theme.textSecondary}>
              {strings.help.to(item.professional_name)}
            </AppText>
            <AppText numberOfLines={3}>{item.message}</AppText>
          </Card>
        </Pressable>
      )}
    />
  );
}

function Tools() {
  const theme = useTheme();
  const spaces = useSpaces();
  const questions = useWeeklyQuestions();
  return (
    <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
      <AppText variant="heading" accessibilityRole="header">
        {copy.weeklyTitle}
      </AppText>
      <AppText color={theme.textSecondary}>{copy.weeklyHelp}</AppText>
      {spaces.data?.map((space) => (
        <QuestionEditor
          key={`${space.id}-${questions.data?.[space.id]?.id ?? 'none'}`}
          space={space}
          current={questions.data?.[space.id]?.question ?? ''}
        />
      ))}
      <Card>
        <AppText variant="bodyStrong">{strings.home.confessionTitle}</AppText>
        <AppText color={theme.textSecondary}>{copy.featureHelp}</AppText>
      </Card>
    </ScrollView>
  );
}

function QuestionEditor({ space, current }: { space: Space; current: string }) {
  const theme = useTheme();
  const save = useSetWeeklyQuestion();
  const [text, setText] = useState(current);
  const changed = text.trim() !== current && text.trim().length > 0;
  return (
    <Card>
      <AppText variant="bodyStrong">{space.name}</AppText>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        maxLength={300}
        accessibilityLabel={space.name}
        style={[
          styles.input,
          typography.body,
          { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
        ]}
      />
      <Button
        variant="secondary"
        label={save.isSuccess && !changed ? copy.saved : copy.save}
        disabled={!changed}
        loading={save.isPending}
        onPress={() => save.mutate({ spaceId: space.id, question: text })}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  tabs: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    flexGrow: 1,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  context: {
    borderRadius: radii.chip,
    padding: spacing.md,
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    minHeight: minTapSize + 8,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.chip + 4,
  },
  input: {
    minHeight: 72,
    borderWidth: 1.5,
    borderRadius: radii.chip + 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as object,
});
