import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Tag, TriggerWarning } from '@/lib/posts';
import { supabase } from '@/lib/supabase';

export type Domain = 'family' | 'friends' | 'relationships' | 'digital' | 'college_work';
export const DOMAINS: Domain[] = ['family', 'friends', 'relationships', 'digital', 'college_work'];

/** The tag pre-filled when someone taps "Talk about it" after a scenario. */
export const DOMAIN_TAG: Record<Domain, Tag> = {
  family: 'family',
  friends: 'friendships',
  relationships: 'relationships',
  digital: 'digital',
  college_work: 'college_work',
};

export type Choice = { label: string; consequence: string; expert_note: string; next: string };
export type StoryNode = { text: string; choices: Choice[] };
export type OutcomeNode = { outcome: true; title: string; text?: string; takeaway: string };
export type ScenarioNode = StoryNode | OutcomeNode;

export type Scenario = {
  id: string;
  title: string;
  domain: Domain;
  hook: string;
  trigger_warnings: TriggerWarning[];
  /** First drafts stay marked until the designer and the expert have reviewed them */
  draft?: boolean;
  order?: number;
  start: string;
  nodes: Record<string, ScenarioNode>;
};

export function isOutcome(node: ScenarioNode | undefined): node is OutcomeNode {
  return Boolean(node && 'outcome' in node);
}

// Every .json file in content/scenarios is picked up automatically:
// adding a scenario needs no code change.
const files = require.context('../../content/scenarios', false, /\.json$/);
export const scenarios: Scenario[] = files
  .keys()
  .map((key) => files(key) as Scenario)
  .filter((scenario) => scenario?.id && scenario.nodes?.[scenario.start])
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title));

export function getScenario(id: string) {
  return scenarios.find((scenario) => scenario.id === id);
}

export type Progress = {
  scenario_id: string;
  current_node: string;
  /** The labels chosen so far, in order */
  path: string[];
  completed_at: string | null;
  updated_at: string;
};

export type ScenarioStatus = 'new' | 'in_progress' | 'done';

export function statusOf(progress: Progress | undefined): ScenarioStatus {
  if (!progress) return 'new';
  return progress.completed_at ? 'done' : 'in_progress';
}

const KEY = ['scenario-progress'];

/** This person's progress in every scenario, keyed by scenario id. */
export function useScenarioProgress() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scenario_progress')
        .select('scenario_id, current_node, path, completed_at, updated_at')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      const byId: Record<string, Progress> = {};
      for (const row of data as Progress[]) byId[row.scenario_id] = row;
      return byId;
    },
  });
}

export function useSaveProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { scenarioId: string; node: string; path: string[]; completed: boolean }) => {
      const values = {
        current_node: input.node,
        path: input.path,
        completed_at: input.completed ? new Date().toISOString() : null,
      };
      // Update the saved row; if there isn't one yet, create it.
      const updated = await supabase
        .from('scenario_progress')
        .update(values)
        .eq('scenario_id', input.scenarioId)
        .select('scenario_id');
      if (updated.error) throw updated.error;
      if (updated.data.length > 0) return;
      const { error } = await supabase
        .from('scenario_progress')
        .insert({ scenario_id: input.scenarioId, ...values });
      if (error) throw error;
    },
    // Show the new position immediately; the story shouldn't wait for the network.
    onMutate: (input) => {
      queryClient.setQueryData<Record<string, Progress>>(KEY, (cached = {}) => ({
        ...cached,
        [input.scenarioId]: {
          scenario_id: input.scenarioId,
          current_node: input.node,
          path: input.path,
          completed_at: input.completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
      }));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
