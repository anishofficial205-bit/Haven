import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ReportReason, TargetType } from '@/lib/posts';
import { supabase } from '@/lib/supabase';

/** A block, as the app is allowed to see it: when, and nothing about whom. */
export type Block = { id: string; created_at: string };
export type MyReport = {
  id: string;
  target_type: TargetType;
  reason: ReportReason;
  status: 'open' | 'actioned' | 'dismissed';
  created_at: string;
};

export function useBlocks() {
  return useQuery({
    queryKey: ['blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocks')
        .select('id, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Block[];
    },
  });
}

export function useUnblock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockId: string) => {
      const { error } = await supabase.from('blocks').delete().eq('id', blockId);
      if (error) throw error;
    },
    onSuccess: () =>
      Promise.all(['blocks', 'posts', 'replies'].map((key) => queryClient.invalidateQueries({ queryKey: [key] }))),
  });
}

export function useMyReports() {
  return useQuery({
    queryKey: ['my-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('id, target_type, reason, status, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MyReport[];
    },
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
