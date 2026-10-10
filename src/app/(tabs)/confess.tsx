import { router } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Ellipsis,
  MessageCircle,
  PenLine,
  SlidersHorizontal,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { AnonymousAvatar } from "@/components/AnonymousAvatar";
import { AppText } from "@/components/AppText";
import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Dots } from "@/components/Dots";
import { Glow } from "@/components/Glow";
import { PostMenu, type MenuTarget } from "@/components/PostMenu";
import { PressableScale } from "@/components/PressableScale";
import { REACTION_ICONS } from "@/components/ReactionBar";
import { ReplyComposer } from "@/components/ReplyComposer";
import { useTheme } from "@/hooks/useTheme";
import { strings } from "@/i18n/en";
import {
  REACTIONS,
  TAGS,
  useConfessionFeed,
  useCreateReply,
  useMyPosts,
  useReact,
  useReplies,
  type ConfessionSort,
  type PostCard as Post,
  type Tag,
} from "@/lib/posts";
import { timeAgo } from "@/lib/time";
import { FEATURE_TONE, radii, shades, spacing } from "@/theme";

const copy = strings.confess;
const P = shades[FEATURE_TONE.confess];
const SORTS: ConfessionSort[] = ["recent", "supported", "advice"];
type Mode = "read" | "mine";

const openPost = (id: string) =>
  router.push({ pathname: "/post/[id]", params: { id } });
const menuFor = (post: Post): MenuTarget => ({
  targetType: "post",
  id: post.id,
  isMine: post.is_mine,
  isSaved: post.is_saved,
  canFeature: post.status === "published",
});

/**
 * Two modes. Read: other people's confessions, one card at a time, swiped
 * through. My confessions: what you posted and what came back.
 */
export default function ConfessScreen() {
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>("read");
  const [tag, setTag] = useState<Tag | null>(null);
  const [sort, setSort] = useState<ConfessionSort>("recent");
  const [filterOpen, setFilterOpen] = useState(false);
  const [menu, setMenu] = useState<MenuTarget | null>(null);
  const filtered = tag !== null || sort !== "recent";

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <Dots />
      <View style={styles.controls}>
        <View
          style={styles.segment}
          accessibilityRole="radiogroup"
          accessibilityLabel={copy.modeLabel}
        >
          {(["read", "mine"] as const).map((option) => {
            const selected = mode === option;
            return (
              <Pressable
                key={option}
                onPress={() => setMode(option)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[
                  styles.segmentItem,
                  selected && { backgroundColor: P[1] },
                ]}
              >
                <AppText
                  variant="label"
                  color={selected ? P[7] : P[1]}
                  numberOfLines={1}
                >
                  {copy.modes[option]}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        {mode === "read" ? (
          <Pressable
            onPress={() => setFilterOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={copy.filter}
            style={[
              styles.filter,
              filtered && { backgroundColor: P[1], borderColor: P[1] },
            ]}
          >
            <SlidersHorizontal size={18} color={filtered ? P[7] : P[1]} />
          </Pressable>
        ) : null}
      </View>

      {mode === "read" ? (
        // A new filter starts a new deck from its first card.
        <Deck
          key={`${tag}-${sort}`}
          tag={tag}
          sort={sort}
          filtered={filtered}
          onMenu={setMenu}
        />
      ) : (
        <Mine onMenu={setMenu} />
      )}

      <BottomSheet
        visible={filterOpen}
        title={copy.filterTitle}
        onClose={() => setFilterOpen(false)}
      >
        <AppText variant="strip" color={P[2]}>
          {copy.topicLabel.toUpperCase()}
        </AppText>
        <View
          style={styles.wrap}
          accessibilityRole="radiogroup"
          accessibilityLabel={copy.topicLabel}
        >
          <Chip
            role="radio"
            shades={P}
            label={strings.feed.all}
            selected={tag === null}
            onPress={() => setTag(null)}
          />
          {TAGS.map((option) => (
            <Chip
              key={option}
              role="radio"
              shades={P}
              label={strings.tags[option]}
              selected={tag === option}
              onPress={() => setTag(option)}
            />
          ))}
        </View>
        <AppText variant="strip" color={P[2]}>
          {strings.feed.sortLabel.toUpperCase()}
        </AppText>
        <View
          style={styles.wrap}
          accessibilityRole="radiogroup"
          accessibilityLabel={strings.feed.sortLabel}
        >
          {SORTS.map((option) => (
            <Chip
              key={option}
              role="radio"
              shades={P}
              label={strings.feed.sort[option]}
              selected={sort === option}
              onPress={() => setSort(option)}
            />
          ))}
        </View>
      </BottomSheet>
      <PostMenu target={menu} onClose={() => setMenu(null)} />
    </View>
  );
}

type DeckProps = {
  tag: Tag | null;
  sort: ConfessionSort;
  filtered: boolean;
  onMenu: (target: MenuTarget) => void;
};

function Deck({ tag, sort, filtered, onMenu }: DeckProps) {
  const theme = useTheme();
  const feed = useConfessionFeed(tag, sort);
  const [index, setIndex] = useState(0);
  const [replyTo, setReplyTo] = useState<Post | null>(null);
  // Your own confessions live in the other mode.
  const posts = (feed.data ?? []).filter((post) => !post.is_mine);
  const post = posts[index];

  if (!post) {
    const done = posts.length > 0;
    return (
      <View style={styles.center}>
        {feed.isPending ? (
          <ActivityIndicator color={P[1]} />
        ) : (
          <>
            <AppText variant="title" style={styles.centerText}>
              {done ? copy.endTitle : null}
            </AppText>
            <AppText
              color={feed.isError ? theme.danger : theme.textSecondary}
              style={styles.centerText}
            >
              {feed.isError
                ? strings.feed.loadError
                : done
                  ? copy.endBody
                  : filtered
                    ? strings.feed.emptyFiltered
                    : strings.feed.empty}
            </AppText>
            {done ? (
              <Button
                variant="secondary"
                label={copy.startAgain}
                onPress={() => {
                  setIndex(0);
                  feed.refetch();
                }}
              />
            ) : null}
            <Compose />
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.deck}>
      <View style={styles.stack}>
        <View style={[styles.behind, styles.behindFar]} />
        <View style={[styles.behind, styles.behindNear]} />
        <SwipeCard
          key={post.id}
          post={post}
          canGoBack={index > 0}
          onNext={() => setIndex(index + 1)}
          onPrevious={() => setIndex(index - 1)}
          onMenu={() => onMenu(menuFor(post))}
        />
      </View>

      <Pressable
        onPress={() => setReplyTo(post)}
        accessibilityRole="button"
        accessibilityLabel={copy.replyBar}
        style={styles.replyBar}
      >
        <AppText variant="label" color={P[2]} style={styles.flex}>
          {copy.replyBar}
        </AppText>
        <View style={styles.replySend}>
          <ArrowUp size={18} color={P[7]} />
        </View>
      </Pressable>

      <View style={styles.pager}>
        <Pressable
          onPress={() => setIndex(index - 1)}
          disabled={index === 0}
          accessibilityRole="button"
          accessibilityLabel={copy.previous}
          hitSlop={8}
          style={[styles.step, index === 0 && styles.faded]}
        >
          <ArrowLeft size={16} color={P[1]} />
        </Pressable>
        <AppText variant="numeral" color={P[1]} style={styles.counter}>
          {copy.counter(index + 1, posts.length)}
        </AppText>
        <AppText
          variant="caption"
          color={P[2]}
          style={styles.flex}
          numberOfLines={1}
        >
          {copy.swipeHint}
        </AppText>
        <Pressable
          onPress={() => setIndex(index + 1)}
          accessibilityRole="button"
          accessibilityLabel={copy.next}
          hitSlop={8}
          style={styles.step}
        >
          <ArrowRight size={16} color={P[1]} />
        </Pressable>
      </View>

      {replyTo ? (
        <ReplySheet post={replyTo} onClose={() => setReplyTo(null)} />
      ) : null}
    </View>
  );
}

type CardProps = {
  post: Post;
  canGoBack: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onMenu: () => void;
};

/** One confession, big. Drag it left for the next one, right for the one before. */
function SwipeCard({ post, canGoBack, onNext, onPrevious, onMenu }: CardProps) {
  const theme = useTheme();
  const react = useReact();
  const [x] = useState(() => new Animated.Value(0));
  const [revealed, setRevealed] = useState(false);
  const hidden = post.trigger_warnings.length > 0 && !revealed;

  const responder = useMemo(
    () =>
      PanResponder.create({
        // Only sideways drags: up and down still scrolls a long confession.
        onMoveShouldSetPanResponder: (_event, g) =>
          Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
        onPanResponderMove: (_event, g) => x.setValue(g.dx),
        onPanResponderRelease: (_event, g) => {
          const left = g.dx < -90 || g.vx < -0.8;
          const right = canGoBack && (g.dx > 90 || g.vx > 0.8);
          if (!left && !right) {
            Animated.spring(x, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 8,
            }).start();
            return;
          }
          Animated.timing(x, {
            toValue: left ? -480 : 480,
            duration: 170,
            useNativeDriver: true,
          }).start(() => (left ? onNext() : onPrevious()));
        },
        onPanResponderTerminate: () =>
          Animated.spring(x, { toValue: 0, useNativeDriver: true }).start(),
      }),
    [x, canGoBack, onNext, onPrevious],
  );

  const length = post.body.length;
  const size = length <= 90 ? 25 : length <= 180 ? 21 : length <= 320 ? 18 : 16;
  const replies = strings.post.replies(post.reply_count);

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.cardWrap,
        {
          transform: [
            { translateX: x },
            {
              rotate: x.interpolate({
                inputRange: [-300, 300],
                outputRange: ["-8deg", "8deg"],
              }),
            },
          ],
        },
      ]}
    >
      <Glow tone={FEATURE_TONE.confess} style={styles.card}>
        <View style={styles.row}>
          <AnonymousAvatar tone={FEATURE_TONE.confess} />
          <AppText variant="label" numberOfLines={1} style={styles.flex}>
            {strings.post.anonymous}
            <AppText variant="caption" color={P[0]}>
              {"  "}
              {[
                timeAgo(post.created_at),
                post.is_seed ? strings.post.sample : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </AppText>
          </AppText>
          <Pressable
            onPress={onMenu}
            accessibilityRole="button"
            accessibilityLabel={strings.post.moreOptions}
            hitSlop={10}
          >
            <Ellipsis size={20} color={P[0]} />
          </Pressable>
        </View>

        {hidden ? (
          // The real words are not rendered at all until "Show anyway" is tapped.
          <View style={styles.gate}>
            <AppText variant="label">{strings.post.warningTitle}</AppText>
            <View style={styles.wrap}>
              {post.trigger_warnings.map((warning) => (
                <Chip
                  key={warning}
                  tone="warning"
                  label={strings.triggerWarnings[warning]}
                />
              ))}
            </View>
            <Button
              variant="secondary"
              label={strings.post.showAnyway}
              onPress={() => setRevealed(true)}
            />
          </View>
        ) : (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.words}
            showsVerticalScrollIndicator={false}
          >
            <AppText
              variant={size > 16 ? "title" : "body"}
              style={
                size > 16
                  ? { fontSize: size, lineHeight: size * 1.22 }
                  : undefined
              }
            >
              {post.body}
            </AppText>
          </ScrollView>
        )}

        <Pressable
          onPress={() => openPost(post.id)}
          accessibilityRole="button"
          accessibilityHint={strings.post.openPost}
        >
          <AppText variant="strip" color={P[0]}>
            {copy
              .cardMeta(
                post.tags.map((tag) => strings.tags[tag]).join(", "),
                replies,
              )
              .toUpperCase()}
          </AppText>
        </Pressable>

        <View style={styles.reactions}>
          {REACTIONS.map((key) => {
            const Icon = REACTION_ICONS[key];
            const selected = post.my_reaction === key;
            return (
              <Pressable
                key={key}
                onPress={() =>
                  react.mutate({
                    targetType: "post",
                    id: post.id,
                    current: post.my_reaction,
                    emoji: key,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={strings.reactions.count(
                  strings.reactions[key].label,
                  post.reaction_counts[key] ?? 0,
                )}
                accessibilityState={{ selected }}
                hitSlop={4}
                style={[
                  styles.reaction,
                  { backgroundColor: selected ? P[0] : theme.wash },
                ]}
              >
                <Icon
                  size={19}
                  color={selected ? P[6] : "#FFFFFF"}
                  fill={selected && key === "love" ? P[6] : "none"}
                />
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => openPost(post.id)}
            accessibilityRole="button"
            accessibilityLabel={replies}
            hitSlop={4}
            style={[styles.reaction, { backgroundColor: theme.wash }]}
          >
            <MessageCircle size={19} color="#FFFFFF" />
          </Pressable>
        </View>
      </Glow>
    </Animated.View>
  );
}

/** The reply box, sliding up over the card and staying above the keyboard. */
function ReplySheet({ post, onClose }: { post: Post; onClose: () => void }) {
  const theme = useTheme();
  const reply = useCreateReply(post.id);
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.sheetFill}
      >
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={strings.common.close}
        />
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { backgroundColor: theme.background }]}
        >
          <View style={styles.sheetTitle}>
            <AppText
              variant="heading"
              accessibilityRole="header"
              style={styles.flex}
            >
              {copy.replyTitle}
            </AppText>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={strings.common.close}
              hitSlop={10}
            >
              <X size={24} color={theme.text} />
            </Pressable>
          </View>
          <ReplyComposer
            onSend={(input) => reply.mutateAsync(input)}
            sending={reply.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Compose() {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={() => router.push("/compose")}
      accessibilityRole="button"
      accessibilityLabel={strings.feed.compose}
      style={[styles.compose, { backgroundColor: theme.primary }]}
    >
      <PenLine size={20} color={theme.onPrimary} />
      <AppText variant="bodyStrong" color={theme.onPrimary}>
        {strings.tabs.confess}
      </AppText>
    </PressableScale>
  );
}

function Mine({ onMenu }: { onMenu: (target: MenuTarget) => void }) {
  const theme = useTheme();
  const mine = useMyPosts();
  const posts = (mine.data ?? []).filter((post) => post.kind === "confession");
  return (
    <View style={styles.flex}>
      <FlatList
        data={posts}
        keyExtractor={(post) => post.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={mine.isRefetching}
            onRefresh={mine.refetch}
            tintColor={P[1]}
          />
        }
        ListEmptyComponent={
          mine.isPending ? (
            <ActivityIndicator color={P[1]} style={styles.empty} />
          ) : (
            <AppText
              color={mine.isError ? theme.danger : theme.textSecondary}
              style={[styles.centerText, styles.empty]}
            >
              {mine.isError ? strings.feed.loadError : copy.mineEmpty}
            </AppText>
          )
        }
        renderItem={({ item }) => (
          <MinePanel post={item} onMenu={() => onMenu(menuFor(item))} />
        )}
      />
      <View style={styles.floating}>
        <Compose />
      </View>
    </View>
  );
}

/** One of your confessions: what you said, how people reacted, and the newest reply. */
function MinePanel({ post, onMenu }: { post: Post; onMenu: () => void }) {
  const replies = useReplies(post.id);
  const newest = (replies.data ?? [])
    .filter((reply) => reply.status === "approved" && !reply.is_mine)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const status =
    post.status === "pending"
      ? strings.post.pending
      : post.status === "rejected"
        ? strings.post.rejected
        : post.status === "hidden"
          ? strings.post.hidden
          : null;

  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <AnonymousAvatar tone={FEATURE_TONE.confess} />
        <AppText variant="label" numberOfLines={1} style={styles.flex}>
          {copy.you}
          <AppText variant="caption" color={P[2]}>
            {"  "}
            {[
              timeAgo(post.created_at),
              ...post.tags.map((tag) => strings.tags[tag]),
            ].join(" · ")}
          </AppText>
        </AppText>
        <Pressable
          onPress={onMenu}
          accessibilityRole="button"
          accessibilityLabel={strings.post.moreOptions}
          hitSlop={10}
        >
          <Ellipsis size={20} color={P[2]} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => openPost(post.id)}
        accessibilityRole="button"
        accessibilityHint={strings.post.openPost}
        style={styles.panelBody}
      >
        <AppText numberOfLines={5}>{post.body}</AppText>

        {status ? (
          <View style={styles.inset}>
            <AppText variant="label" color={P[1]}>
              {status}
            </AppText>
          </View>
        ) : (
          <>
            <View style={styles.row}>
              <View style={styles.count}>
                <REACTION_ICONS.love size={14} color={P[1]} />
                <AppText variant="label" color={P[1]}>
                  {copy.reactionsTotal(post.reaction_total)}
                </AppText>
              </View>
              <View style={styles.count}>
                <MessageCircle size={14} color={P[1]} />
                <AppText variant="label" color={P[1]}>
                  {strings.post.replies(post.reply_count)}
                </AppText>
              </View>
            </View>
            {newest ? (
              <View style={styles.inset}>
                <View
                  style={[
                    styles.kind,
                    newest.kind === "advice"
                      ? styles.kindOutline
                      : { backgroundColor: P[1] },
                  ]}
                >
                  <AppText
                    variant="strip"
                    color={newest.kind === "advice" ? P[1] : P[7]}
                  >
                    {copy
                      .newest(strings.replies.kinds[newest.kind])
                      .toUpperCase()}
                  </AppText>
                </View>
                <AppText variant="label" color={P[0]} numberOfLines={3}>
                  {newest.body}
                </AppText>
              </View>
            ) : null}
          </>
        )}
      </Pressable>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  controls: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    padding: 4,
    borderRadius: radii.pill,
    backgroundColor: P[8],
    borderWidth: 1,
    borderColor: P[6],
  },
  segmentItem: {
    flex: 1,
    height: 36,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  filter: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: P[8],
    borderWidth: 1,
    borderColor: P[6],
  },
  deck: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  stack: {
    flex: 1,
    paddingTop: 14,
  },
  behind: {
    position: "absolute",
    top: 0,
    height: 60,
    borderRadius: 28,
  },
  behindFar: {
    left: 26,
    right: 26,
    backgroundColor: P[7],
  },
  behindNear: {
    top: 7,
    left: 13,
    right: 13,
    backgroundColor: P[6],
  },
  cardWrap: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 30,
    padding: spacing.lg + 2,
    gap: spacing.md,
  },
  words: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  gate: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  reactions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reaction: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  replyBar: {
    height: 52,
    borderRadius: radii.pill,
    paddingLeft: spacing.lg + 2,
    paddingRight: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: P[8],
    borderWidth: 1,
    borderColor: P[6],
  },
  replySend: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: P[1],
  },
  pager: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  counter: {
    fontSize: 22,
    lineHeight: 22,
  },
  step: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: P[5],
  },
  faded: {
    opacity: 0.35,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  centerText: {
    textAlign: "center",
  },
  empty: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 96,
    gap: spacing.md,
    flexGrow: 1,
  },
  panel: {
    borderRadius: radii.card,
    padding: spacing.lg - 2,
    gap: spacing.sm + 2,
    backgroundColor: P[8],
    borderWidth: 1,
    borderColor: P[6],
  },
  panelBody: {
    gap: spacing.sm + 2,
  },
  count: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginRight: spacing.sm,
  },
  inset: {
    borderRadius: radii.chip + 4,
    padding: spacing.md,
    gap: 6,
    alignItems: "flex-start",
    backgroundColor: P[7],
  },
  kind: {
    height: 20,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    justifyContent: "center",
  },
  kindOutline: {
    borderWidth: 1,
    borderColor: P[3],
  },
  floating: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
  },
  compose: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sheetFill: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(18, 14, 31, 0.5)",
  },
  sheet: {
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingTop: spacing.md,
  },
  sheetTitle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
});
