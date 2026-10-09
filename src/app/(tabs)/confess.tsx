import { router } from 'expo-router';
import { PenLine } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { PostCard } from '@/components/PostCard';
import { PostMenu, type MenuTarget } from '@/components/PostMenu';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { TAGS, useConfessionFeed, type ConfessionSort, type Tag } from '@/lib/posts';
import { radii, spacing } from '@/theme';

const SORTS: ConfessionSort[] = ['recent', 'supported', 'advice'];

export default function ConfessScreen() {
  const theme = useTheme();
  const [tag, setTag] = useState<Tag | null>(null);
  const [sort, setSort] = useState<ConfessionSort>('recent');
  const [menu, setMenu] = useState<MenuTarget | null>(null);
  const feed = useConfessionFeed(tag, sort);
  const filtered = tag !== null || sort === 'advice';

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <FlatList
        data={feed.data ?? []}
        keyExtractor={(post) => post.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={feed.isRefetching}
            onRefresh={feed.refetch}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.filters}>
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
                  label={strings.feed.sort[option]}
                  selected={sort === option}
                  onPress={() => setSort(option)}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          feed.isPending ? (
            <ActivityIndicator color={theme.primary} style={styles.empty} />
          ) : (
            <AppText color={feed.isError ? theme.danger : theme.textSecondary} style={styles.empty}>
              {feed.isError
                ? strings.feed.loadError
                : filtered
                  ? strings.feed.emptyFiltered
                  : strings.feed.empty}
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
        onPress={() => router.push('/compose')}
        accessibilityRole="button"
        accessibilityLabel={strings.feed.compose}
        style={({ pressed }) => [
          styles.compose,
          { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
        ]}>
        <PenLine size={22} color={theme.onPrimary} />
        <AppText variant="bodyStrong" color={theme.onPrimary}>
          {strings.tabs.confess}
        </AppText>
      </Pressable>

      <PostMenu target={menu} onClose={() => setMenu(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 96,
    gap: spacing.md,
    flexGrow: 1,
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
    bottom: spacing.lg,
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
