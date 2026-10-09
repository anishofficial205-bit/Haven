import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Strip } from '@/components/Collector';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StoryText } from '@/components/StoryText';
import { Tile } from '@/components/Tile';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import {
  DOMAIN_TAG,
  getScenario,
  isOutcome,
  useSaveProgress,
  useScenarioProgress,
  type Choice,
  type Scenario,
} from '@/lib/scenarios';
import { minTapSize, radii, spacing } from '@/theme';

const copy = strings.scenarios;

export default function ScenarioScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scenario = getScenario(id);
  const progress = useScenarioProgress();

  if (!scenario) {
    return (
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        <ScreenHeader title={copy.title} />
        <AppText color={theme.textSecondary} style={styles.missing}>
          {copy.notFound}
        </AppText>
      </View>
    );
  }
  // Wait for saved progress so the story opens where it was left.
  if (progress.isPending) {
    return (
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        <ScreenHeader title={scenario.title} />
      </View>
    );
  }

  const saved = progress.data?.[scenario.id];
  const startNode = saved && scenario.nodes[saved.current_node] ? saved.current_node : scenario.start;
  return <Player scenario={scenario} startNode={startNode} startPath={saved?.path ?? []} />;
}

type PlayerProps = { scenario: Scenario; startNode: string; startPath: string[] };

/**
 * One node at a time: the story, then your choice, then what happens and why
 * it matters, then on to the next node. No scores and no right answers.
 */
function Player({ scenario, startNode, startPath }: PlayerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const save = useSaveProgress();
  const scroll = useRef<ScrollView>(null);

  const [nodeId, setNodeId] = useState(startNode);
  const [path, setPath] = useState(startPath);
  const [chosen, setChosen] = useState<Choice | null>(null);
  const node = scenario.nodes[nodeId];

  const toTop = () => scroll.current?.scrollTo({ y: 0, animated: false });

  const choose = (choice: Choice) => {
    setChosen(choice);
    const nextPath = [...path, choice.label];
    setPath(nextPath);
    // Saved as soon as the choice is made, so closing the app loses nothing.
    save.mutate({
      scenarioId: scenario.id,
      node: choice.next,
      path: nextPath,
      completed: isOutcome(scenario.nodes[choice.next]),
    });
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  const goOn = () => {
    if (!chosen) return;
    setNodeId(chosen.next);
    setChosen(null);
    toTop();
  };

  const restart = () => {
    setNodeId(scenario.start);
    setPath([]);
    setChosen(null);
    save.mutate({ scenarioId: scenario.id, node: scenario.start, path: [], completed: false });
    toTop();
  };

  if (isOutcome(node)) {
    return (
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        <ScreenHeader title={scenario.title} />
        <ScrollView ref={scroll} contentContainerStyle={styles.content}>
          <AppText variant="label" color={theme.textSecondary}>
            {copy.outcome}
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            {node.title}
          </AppText>
          {node.text ? <StoryText text={node.text} /> : null}

          <Tile tone="lime">
            <Strip left={copy.takeaway} stars={3} />
            <AppText variant="display">{node.takeaway}</AppText>
          </Tile>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Button label={copy.tryAgain} onPress={restart} />
          <Button
            variant="secondary"
            label={copy.talk}
            onPress={() => router.push({ pathname: '/compose', params: { tag: DOMAIN_TAG[scenario.domain] } })}
          />
          <Button variant="text" label={copy.needHelp} onPress={() => router.navigate('/help')} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={scenario.title} />
      <ScrollView ref={scroll} contentContainerStyle={styles.content}>
        <StoryText text={node.text} />

        {chosen ? (
          <>
            <View style={styles.youRow}>
              <View style={[styles.youBubble, { backgroundColor: theme.blocks.lime }]}>
                <AppText variant="caption" color={theme.ink}>
                  {copy.you}
                </AppText>
                <AppText color={theme.ink}>{chosen.label}</AppText>
              </View>
            </View>

            <View style={styles.block}>
              <AppText variant="label" color={theme.textSecondary}>
                {copy.whatHappens}
              </AppText>
              <StoryText text={chosen.consequence} />
            </View>

            <Tile tone="rose">
              <AppText variant="display" style={styles.noteTitle}>
                {copy.whyItMatters}
              </AppText>
              <AppText>{chosen.expert_note}</AppText>
            </Tile>
          </>
        ) : (
          <View style={styles.block}>
            <AppText variant="label" color={theme.textSecondary}>
              {copy.choose}
            </AppText>
            {node.choices.map((choice) => (
              <Pressable
                key={choice.label}
                onPress={() => choose(choice)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.choice,
                  {
                    backgroundColor: pressed ? theme.blocks.lime : theme.paper,
                    borderColor: theme.ink,
                  },
                ]}>
                <AppText variant="bodyStrong" color={theme.ink}>
                  {choice.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      {chosen ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Button label={copy.continue} onPress={goOn} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  missing: {
    textAlign: 'center',
    padding: spacing.xxl,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  block: {
    gap: spacing.md,
  },
  choice: {
    minHeight: minTapSize + 12,
    borderRadius: radii.card,
    borderBottomRightRadius: radii.sharp,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  youRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: spacing.xxl,
  },
  youBubble: {
    borderRadius: radii.card,
    borderBottomRightRadius: radii.sharp,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 2,
    flexShrink: 1,
  },
  noteTitle: {
    fontSize: 22,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
});
