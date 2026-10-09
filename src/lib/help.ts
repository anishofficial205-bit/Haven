import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export const PROFESSIONAL_TYPES = ['therapist', 'intimacy_coach', 'legal_advisor'] as const;
export type ProfessionalType = (typeof PROFESSIONAL_TYPES)[number];
export const REQUEST_STATUSES = ['sent', 'accepted', 'scheduled', 'closed'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export const HELP_MESSAGE_MAX = 800;

export type Professional = {
  id: string;
  type: ProfessionalType;
  name: string;
  bio: string;
  qualifications: string;
  languages: string[];
  focus_areas: string[];
  availability_note: string;
  placeholder: boolean;
};

export type HelpRequest = {
  id: string;
  user_id: string;
  type: ProfessionalType;
  topic: string;
  message: string;
  language: string;
  time_window: string;
  status: RequestStatus;
  created_at: string;
  professionals: { name: string } | null;
};

export type HelpMessage = { id: string; sender: 'user' | 'staff'; body: string; created_at: string };

const PROFESSIONAL_COLUMNS = 'id, type, name, bio, qualifications, languages, focus_areas, availability_note, placeholder';
const REQUEST_COLUMNS =
  'id, user_id, type, topic, message, language, time_window, status, created_at, professionals(name)';

export function useProfessionals(type: ProfessionalType) {
  return useQuery({
    queryKey: ['professionals', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select(PROFESSIONAL_COLUMNS)
        .eq('type', type)
        .order('name');
      if (error) throw error;
      return data as Professional[];
    },
  });
}

export function useProfessional(id: string) {
  return useQuery({
    queryKey: ['professionals', 'one', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select(PROFESSIONAL_COLUMNS)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Professional | null;
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      professional: Professional;
      topic: string;
      message: string;
      language: string;
      timeWindow: string;
    }) => {
      const { error } = await supabase.from('help_requests').insert({
        professional_id: input.professional.id,
        type: input.professional.type,
        topic: input.topic,
        message: input.message.trim(),
        language: input.language,
        time_window: input.timeWindow,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['help-requests'] }),
  });
}

/** The signed-in person's own requests. (Moderators use the inbox in lib/mod.ts.) */
export function useMyRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ['help-requests', 'mine', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_requests')
        .select(REQUEST_COLUMNS)
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as HelpRequest[];
    },
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: ['help-requests', 'one', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('help_requests').select(REQUEST_COLUMNS).eq('id', id).maybeSingle();
      if (error) throw error;
      return data as unknown as HelpRequest | null;
    },
  });
}

export function useHelpMessages(requestId: string) {
  return useQuery({
    queryKey: ['help-messages', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_messages')
        .select('id, sender, body, created_at')
        .eq('request_id', requestId)
        .order('created_at');
      if (error) throw error;
      return data as HelpMessage[];
    },
  });
}

/** The database decides whether a message is from the user or from staff. */
export function useSendHelpMessage(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase.from('help_messages').insert({ request_id: requestId, body: body.trim() });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['help-messages', requestId] }),
  });
}

/** Moderators only; the database refuses anyone else. */
export function useSetRequestStatus(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: RequestStatus) => {
      const { error } = await supabase.from('help_requests').update({ status }).eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['help-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['mod', 'help'] }),
      ]),
  });
}
