import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export const TAGS = ['relationships', 'family', 'friendships', 'digital', 'college_work', 'boundaries', 'other'] as const;
export const TRIGGER_WARNINGS = ['violence', 'harassment', 'abuse', 'breakup', 'anxiety', 'body'] as const;
export const REACTIONS = ['with_you', 'hug', 'love', 'got_this', 'same_here'] as const;
export const REPORT_REASONS = ['harassment', 'hateful', 'sexual_content', 'self_harm_risk', 'spam', 'other'] as const;

export type Tag = (typeof TAGS)[number];
export type TriggerWarning = (typeof TRIGGER_WARNINGS)[number];
export type Reaction = (typeof REACTIONS)[number];
export type ReportReason = (typeof REPORT_REASONS)[number];
export type ReplyKind = 'advice' | 'solidarity';
export type TargetType = 'post' | 'reply';
export type ConfessionSort = 'recent' | 'supported' | 'advice';

export const CONFESSION_MAX = 1000;
export const SPACE_POST_MAX = 1500;
export const REPLY_MAX = 500;

type ReactionState = {
  reaction_counts: Partial<Record<Reaction, number>>;
  reaction_total: number;
  my_reaction: Reaction | null;
};

/**
 * A post as the database hands it to the app. There is no author on it,
 * by design: `is_mine` is all anyone ever learns about who wrote something.
 */
export type PostCard = ReactionState & {
  id: string;
  kind: 'confession' | 'space_post';
  space_id: string | null;
  post_type: 'question' | 'story' | 'rant' | null;
  body: string;
  tags: Tag[];
  trigger_warnings: TriggerWarning[];
  status: 'published' | 'pending' | 'rejected' | 'hidden';
  moderation_reason: string | null;
  is_seed: boolean;
  created_at: string;
  is_mine: boolean;
  is_saved: boolean;
  reply_count: number;
  advice_count: number;
};

export type ReplyCard = ReactionState & {
  id: string;
  post_id: string | null;
  question_id: string | null;
  kind: ReplyKind;
  body: string;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  moderation_reason: string | null;
  highlighted: boolean;
  created_at: string;
  is_mine: boolean;
};

// Query keys. Everything that lists posts starts with 'posts', so one
// invalidation refreshes every feed.
const keys = {
  posts: ['posts'] as const,
  confessions: (tag: Tag | null, sort: ConfessionSort) => ['posts', 'confessions', tag, sort] as const,
  post: (id: string) => ['posts', 'detail', id] as const,
  replies: (postId: string) => ['replies', postId] as const,
};

export function useConfessionFeed(tag: Tag | null, sort: ConfessionSort) {
  return useQuery({
    queryKey: keys.confessions(tag, sort),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('feed_confessions', {
        p_tag: tag,
        p_sort: sort,
        p_limit: 50,
      });
      if (error) throw error;
      return data as PostCard[];
    },
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: keys.post(id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('post_detail', { p_post_id: id });
      if (error) throw error;
      return ((data as PostCard[])[0] ?? null) as PostCard | null;
    },
  });
}

export function useReplies(postId: string) {
  return useQuery({
    queryKey: keys.replies(postId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_replies', { p_post_id: postId });
      if (error) throw error;
      return data as ReplyCard[];
    },
  });
}

export type NewPost = { body: string; tags: Tag[]; triggerWarnings: TriggerWarning[] };
export type PostResult = { id: string; status: PostCard['status']; moderation_reason: string | null };

/** The database, not the app, decides the author and whether the post goes live. */
export function useCreateConfession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, tags, triggerWarnings }: NewPost) => {
      const { data, error } = await supabase
        .from('posts')
        .insert({ kind: 'confession', body: body.trim(), tags, trigger_warnings: triggerWarnings })
        .select('id, status, moderation_reason')
        .single();
      if (error) throw error;
      return data as PostResult;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.posts }),
  });
}

export function useCreateReply(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ kind, body }: { kind: ReplyKind; body: string }) => {
      const { error } = await supabase.from('replies').insert({ post_id: postId, kind, body: body.trim() });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.replies(postId) }),
  });
}

function withReaction<T extends ReactionState>(item: T, next: Reaction | null): T {
  const counts = { ...item.reaction_counts };
  let total = item.reaction_total;
  if (item.my_reaction) {
    counts[item.my_reaction] = Math.max((counts[item.my_reaction] ?? 1) - 1, 0);
    total -= 1;
  }
  if (next) {
    counts[next] = (counts[next] ?? 0) + 1;
    total += 1;
  }
  return { ...item, reaction_counts: counts, reaction_total: total, my_reaction: next };
}

/** Shows the new reaction straight away in every list that holds the target. */
function patchCached(queryClient: QueryClient, targetType: TargetType, id: string, next: Reaction | null) {
  const root = targetType === 'post' ? 'posts' : 'replies';
  queryClient.setQueriesData<unknown>({ queryKey: [root] }, (cached: unknown) => {
    const patch = (item: PostCard | ReplyCard) => (item.id === id ? withReaction(item, next) : item);
    if (Array.isArray(cached)) return cached.map(patch);
    if (cached && typeof cached === 'object') return patch(cached as PostCard);
    return cached;
  });
}

/** One supportive reaction per person per post. Tapping the same one again removes it. */
export function useReact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { targetType: TargetType; id: string; current: Reaction | null; emoji: Reaction }) => {
      const { targetType, id, current, emoji } = input;
      const mine = supabase.from('reactions');
      const result =
        current === emoji
          ? await mine.delete().eq('target_type', targetType).eq('target_id', id)
          : current
            ? await mine.update({ emoji }).eq('target_type', targetType).eq('target_id', id)
            : await mine.insert({ target_type: targetType, target_id: id, emoji });
      if (result.error) throw result.error;
    },
    onMutate: ({ targetType, id, current, emoji }) =>
      patchCached(queryClient, targetType, id, current === emoji ? null : emoji),
    // Whatever happened, show what the database really has.
    onSettled: (_data, _error, { targetType }) =>
      queryClient.invalidateQueries({ queryKey: [targetType === 'post' ? 'posts' : 'replies'] }),
  });
}

export function useToggleSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, saved }: { postId: string; saved: boolean }) => {
      const { error } = saved
        ? await supabase.from('saves').delete().eq('post_id', postId)
        : await supabase.from('saves').insert({ post_id: postId });
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.posts }),
  });
}

export function useReport() {
  return useMutation({
    mutationFn: async (input: { targetType: TargetType; id: string; reason: ReportReason }) => {
      const { error } = await supabase
        .from('reports')
        .insert({ target_type: input.targetType, target_id: input.id, reason: input.reason });
      // 23505 = this person already reported it. That still counts as sent.
      if (error && error.code !== '23505') throw error;
    },
  });
}

/** The app passes the post or reply, never a user id. The database finds the author. */
export function useBlockAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetType, id }: { targetType: TargetType; id: string }) => {
      const { error } = await supabase.rpc('block_author', { p_target_type: targetType, p_target_id: id });
      if (error) throw error;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.posts }),
        queryClient.invalidateQueries({ queryKey: ['replies'] }),
      ]),
  });
}
