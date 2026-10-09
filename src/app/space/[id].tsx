import { router, useLocalSearchParams } from 'expo-router';
import { PenLine } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { PostCard } from '@/components/PostCard';
import { PostMenu, type MenuTarget } from '@/components/PostMenu';
import { QuestionCard } from '@/components/QuestionCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { TAGS, type Tag } from '@/lib/posts';
import {
  useSpaceFeed,
  useSpaces,
  useToggleMembership,
  useWeeklyQuestions,
  type SpaceSort,
} from '@/lib/spaces';
import { radii, spacing } from '@/theme';

const copy = strings.spaces;
const SORTS: SpaceSort[] = ['recent', 'supported', 'replies'];

export default function SpaceScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spaces = useSpaces();
  const questions = useWeeklyQuestions();
  const toggle = useToggleMembership();
  const [tag, setTag] = useState<Tag | null>(null);
  const [sort, setSort] = useState<SpaceSort>('recent');
  const [menu, setMenu] = useState<MenuTarget | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const feed = useSpaceFeed(id, tag, sort);

  const space = spaces.data?.find((item) => item.id === id);
  const question = questions.data?.[id];

  if (!space) {
    return (
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        <ScreenHeader title={copy.title} />
        {spaces.isPending ? (
          <ActivityIndicator color={theme.primary} style={styles.empty} />
        ) : (
          <AppText color={theme.textSecondary} style={styles.empty}>
            {copy.notFound}
          </AppText>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={space.name} />
      <FlatList
        data={feed.data ?? []}
        keyExtractor={(post) => post.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 96 }]}
        refreshControl={
          <RefreshControl refreshing={feed.isRefetching} onRefresh={feed.refetch} tintColor={theme.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText color={theme.textSecondary}>{space.description}</AppText>
            <View style={styles.actions}>
              <View style={styles.flex}>
                <Button
                  variant={space.joined ? 'secondary' : 'primary'}
                  label={space.joined ? copy.joined : copy.join}
                  onPress={() => toggle.mutate({ spaceId: space.id, joined: space.joined })}
                />
              </View>
              <View style={styles.flex}>
                <Button variant="secondary" label={copy.rules} onPress={() => setRulesOpen(true)} />
              </View>
            </View>

            {question ? <QuestionCard question={question} /> : null}

            <View style={styles.filters}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                accessibilityRole="radiogroup"
                accessibilityLabel={strings.feed.sortLabel}
                contentContainerStyle={styles.chipRow}>
                {SORTS.map((option) => (
                  <Chip
                    key={option}
                    role="radio"
                    label={copy.sort[option]}
                    selected={sort === option}
                    onPress={() => setSort(option)}
                  />
                ))}
              </ScrollView>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                accessibilityRole="radiogroup"
                contentContainerStyle={styles.chipRow}>
                <Chip role="radio" label={strings.feed.all} selected={tag === null} onPress={() => setTag(null)} />
                {TAGS.map((option) => (
                  <Chip
                    key={option}
                    role="radio"
                    label={strings.tags[option]}
                    selected={tag === option}
                    onPress={() => setTag(option)}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          feed.isPending ? (
            <ActivityIndicator color={theme.primary} style={styles.empty} />
          ) : (
            <AppText color={feed.isError ? theme.danger : theme.textSecondary} style={styles.empty}>
              {feed.isError ? strings.feed.loadError : tag ? strings.feed.emptyFiltered : copy.empty}
            </AppText>
          )
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onOpen={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
            onMenu={() =>
              setMenu({ targetType: 'post', id: item.id, isMine: item.is_mine, isSaved: item.is_saved })
            }
          />
        )}
      />

      <Pressable
        onPress={() => router.push({ pathname: '/compose', params: { spaceId: space.id } })}
        accessibilityRole="button"
        accessibilityLabel={copy.compose}
        style={({ pressed }) => [
          styles.compose,
          { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1, bottom: insets.bottom + spacing.lg },
        ]}>
        <PenLine size={22} color={theme.onPrimary} />
        <AppText variant="bodyStrong" color={theme.onPrimary}>
          {copy.compose}
        </AppText>
      </Pressable>

      <BottomSheet visible={rulesOpen} title={copy.rulesTitle} onClose={() => setRulesOpen(false)}>
        {space.rules.split('\n').map((rule) => (
          <AppText key={rule}>• {rule}</AppText>
        ))}
      </BottomSheet>
      <PostMenu target={menu} onClose={() => setMenu(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    flexGrow: 1,
  },
  header: {
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filters: {
    gap: spacing.sm,
    marginHorizontal: -spacing.lg,
  },
  chipRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  compose: {
    position: 'absolute',
    right: spacing.lg,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
