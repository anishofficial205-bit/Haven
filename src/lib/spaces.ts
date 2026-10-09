import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PostCard, PostResult, ReplyCard, ReplyKind, Tag, TriggerWarning } from '@/lib/posts';
import { supabase } from '@/lib/supabase';

export type Space = {
  id: string;
  slug: string;
  name: string;
  description: string;
  rules: string;
  sort_order: number;
  joined: boolean;
};

export type WeeklyQuestion = { id: string; space_id: string; question: string; week_start: string };
export type PostType = 'question' | 'story' | 'rant';
export type SpaceSort = 'recent' | 'supported' | 'replies';
export const POST_TYPES: PostType[] = ['question', 'story', 'rant'];

/** All spaces, the ones you joined first. */
export function useSpaces() {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      const [spaces, memberships] = await Promise.all([
        supabase.from('spaces').select('id, slug, name, description, rules, sort_order').order('sort_order'),
        supabase.from('space_members').select('space_id'),
      ]);
      if (spaces.error) throw spaces.error;
      if (memberships.error) throw memberships.error;
      const joined = new Set(memberships.data.map((row) => row.space_id));
      return spaces.data
        .map((space) => ({ ...space, joined: joined.has(space.id) }) as Space)
        .sort((a, b) => Number(b.joined) - Number(a.joined) || a.sort_order - b.sort_order);
    },
  });
}

export function useToggleMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ spaceId, joined }: { spaceId: string; joined: boolean }) => {
      const { error } = joined
        ? await supabase.from('space_members').delete().eq('space_id', spaceId)
        : await supabase.from('space_members').insert({ space_id: spaceId });
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  });
}

/** The current pinned question of every space, keyed by space id. */
export function useWeeklyQuestions() {
  return useQuery({
    queryKey: ['weekly-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_questions')
        .select('id, space_id, question, week_start')
        .lte('week_start', new Date().toISOString().slice(0, 10))
        .order('week_start', { ascending: false });
      if (error) throw error;
      const latest: Record<string, WeeklyQuestion> = {};
      for (const row of data as WeeklyQuestion[]) latest[row.space_id] ??= row;
      return latest;
    },
  });
}

export function useSpaceFeed(spaceId: string, tag: Tag | null, sort: SpaceSort) {
  return useQuery({
    queryKey: ['posts', 'space', spaceId, tag, sort],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('feed_space', {
        p_space_id: spaceId,
        p_tag: tag,
        p_sort: sort,
        p_limit: 50,
      });
      if (error) throw error;
      return data as PostCard[];
    },
  });
}

export function useCreateSpacePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      spaceId: string;
      postType: PostType;
      body: string;
      tags: Tag[];
      triggerWarnings: TriggerWarning[];
    }) => {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          kind: 'space_post',
          space_id: input.spaceId,
          post_type: input.postType,
          body: input.body.trim(),
          tags: input.tags,
          trigger_warnings: input.triggerWarnings,
        })
        .select('id, status, moderation_reason')
        .single();
      if (error) throw error;
      return data as PostResult;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useQuestionReplies(questionId: string) {
  return useQuery({
    queryKey: ['replies', 'question', questionId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_replies', { p_question_id: questionId });
      if (error) throw error;
      return data as ReplyCard[];
    },
  });
}

export function useCreateQuestionReply(questionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ kind, body }: { kind: ReplyKind; body: string }) => {
      const { data, error } = await supabase
        .from('replies')
        .insert({ question_id: questionId, kind, body: body.trim() })
        .select('moderation_reason')
        .single();
      if (error) throw error;
      return data as { moderation_reason: string | null };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['replies'] }),
  });
}
