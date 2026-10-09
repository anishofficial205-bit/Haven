import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { TargetType } from '@/lib/posts';
import { supabase } from '@/lib/supabase';

export type ModTab = 'replies' | 'posts' | 'reports';
export const REJECT_REASONS = ['harassment', 'hateful', 'sexual_content', 'personal_info', 'spam', 'other'] as const;
export type RejectReason = (typeof REJECT_REASONS)[number];
export type BanLength = 1 | 7 | 30 | 'permanent';

/** One row of the mod queue. Like everything else, it does not say who wrote it. */
export type ModItem = {
  target_type: TargetType;
  id: string;
  kind: string;
  body: string;
  status: string;
  moderation_reason: string | null;
  priority: boolean;
  is_seed: boolean;
  created_at: string;
  context: string | null;
  report_count: number;
  report_reasons: string[];
};

export type HelpInboxItem = {
  id: string;
  username: string;
  professional_name: string;
  type: string;
  topic: string;
  message: string;
  language: string;
  time_window: string;
  status: string;
  created_at: string;
};

export function useModQueue(tab: ModTab) {
  return useQuery({
    queryKey: ['mod', 'queue', tab],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('mod_queue', { p_tab: tab });
      if (error) throw error;
      return data as ModItem[];
    },
  });
}

export function useHelpInbox(enabled = true) {
  return useQuery({
    queryKey: ['mod', 'help'],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('mod_help_requests');
      if (error) throw error;
      return data as HelpInboxItem[];
    },
  });
}

/** After any moderator action, refresh the queue and everything it can change. */
function useModAction<Input>(run: (input: Input) => PromiseLike<{ error: { message: string } | null }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Input) => {
      const { error } = await run(input);
      if (error) throw error;
    },
    onSuccess: () =>
      Promise.all(
        ['mod', 'posts', 'replies', 'weekly-questions'].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key] }),
        ),
      ),
  });
}

export function useModReview() {
  return useModAction((input: { item: Pick<ModItem, 'target_type' | 'id'>; approve: boolean; reason?: RejectReason }) =>
    supabase.rpc('mod_review', {
      p_target_type: input.item.target_type,
      p_target_id: input.item.id,
      p_approve: input.approve,
      p_reason: input.reason ?? null,
    }),
  );
}

export function useModBan() {
  return useModAction((input: { item: Pick<ModItem, 'target_type' | 'id'>; length: BanLength }) =>
    supabase.rpc('mod_ban_author', {
      p_target_type: input.item.target_type,
      p_target_id: input.item.id,
      p_days: input.length === 'permanent' ? null : input.length,
    }),
  );
}

export function useSetFeatured() {
  return useModAction((postId: string) => supabase.rpc('mod_set_featured', { p_post_id: postId }));
}

export function useSetHighlight() {
  return useModAction((input: { replyId: string; on: boolean }) =>
    supabase.rpc('mod_set_highlight', { p_reply_id: input.replyId, p_on: input.on }),
  );
}

export function useSetWeeklyQuestion() {
  return useModAction((input: { spaceId: string; question: string }) =>
    supabase.rpc('mod_set_weekly_question', { p_space_id: input.spaceId, p_question: input.question }),
  );
}
