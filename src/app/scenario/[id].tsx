import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Glow } from '@/components/Glow';
import { Asterisk } from '@/components/Objects';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StoryText } from '@/components/StoryText';
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
import { FEATURE_TONE, radii, spacing } from '@/theme';

const copy = strings.scenarios;
const tone = FEATURE_TONE.scenarios;

export default function ScenarioScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scenario = getScenario(id);
  const progress = useScenarioProgress();

  if (!scenario) {
    return (
      <View style={styles.page}>
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
      <View style={styles.page}>
        <ScreenHeader title={copy.title} />
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

  const decisions = Object.values(scenario.nodes).filter((item) => !isOutcome(item)).length;
  const step = Math.min(path.length + (chosen ? 0 : 1), decisions);
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

  const hero = (
    <Glow tone={tone} style={styles.hero}>
      <View style={styles.asterisk}>
        <Asterisk size={96} />
      </View>
      <AppText variant="strip" style={styles.dimmed}>
        {copy.domains[scenario.domain].toUpperCase()}
      </AppText>
      <AppText variant="display" style={styles.heroTitle}>
        {scenario.title}
      </AppText>
      <View style={styles.baseline}>
        <AppText variant="numeral" style={styles.stepNumber}>
          {isOutcome(node) ? `${String(decisions).padStart(2, '0')}/${String(decisions).padStart(2, '0')}` : `${String(step).padStart(2, '0')}/${String(decisions).padStart(2, '0')}`}
        </AppText>
        <AppText variant="caption">{copy.step.toLowerCase()}</AppText>
      </View>
    </Glow>
  );

  if (isOutcome(node)) {
    return (
      <View style={styles.page}>
        <ScreenHeader title={copy.title} />
        <ScrollView ref={scroll} contentContainerStyle={styles.content}>
          {hero}
          <AppText variant="strip" color={theme.textSecondary}>
            {copy.outcome.toUpperCase()}
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            {node.title}
          </AppText>
          {node.text ? <StoryText text={node.text} /> : null}

          <Glow tone={tone} light="right">
            <AppText variant="strip" style={styles.dimmed}>
              {copy.takeaway.toUpperCase()}
            </AppText>
            <AppText variant="title">{node.takeaway}</AppText>
          </Glow>
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
    <View style={styles.page}>
      <ScreenHeader title={copy.title} />
      <ScrollView ref={scroll} contentContainerStyle={styles.content}>
        {hero}
        <StoryText text={node.text} />

        {chosen ? (
          <>
            <View style={styles.youRow}>
              <View style={[styles.youBubble, { backgroundColor: theme.primary }]}>
                <AppText variant="caption" color={theme.onPrimary}>
                  {copy.you}
                </AppText>
                <AppText color={theme.onPrimary}>{chosen.label}</AppText>
              </View>
            </View>

            <View style={styles.block}>
              <AppText variant="strip" color={theme.textSecondary}>
                {copy.whatHappens.toUpperCase()}
              </AppText>
              <StoryText text={chosen.consequence} />
            </View>

            <Glow tone={tone} light="right">
              <AppText variant="bodyStrong">{copy.whyItMatters}</AppText>
              <AppText>{chosen.expert_note}</AppText>
            </Glow>
          </>
        ) : (
          <View style={styles.block}>
            <AppText variant="heading" accessibilityRole="header">
              {copy.choose}
            </AppText>
            {node.choices.map((choice) => (
              <Pressable
                key={choice.label}
                onPress={() => choose(choice)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.choice,
                  pressed && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}>
                {({ pressed }) => (
                  <AppText variant="label" color={pressed ? theme.onPrimary : theme.text} style={styles.choiceText}>
                    {choice.label}
                  </AppText>
                )}
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
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  hero: {
    minHeight: 132,
  },
  asterisk: {
    position: 'absolute',
    right: -12,
    top: -10,
  },
  dimmed: {
    opacity: 0.88,
  },
  heroTitle: {
    paddingRight: 76,
    fontSize: 23,
    lineHeight: 24,
  },
  baseline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  stepNumber: {
    fontSize: 24,
    lineHeight: 24,
  },
  block: {
    gap: spacing.sm + 2,
  },
  choice: {
    minHeight: 48,
    borderWidth: 1.3,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: radii.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  choiceText: {
    fontSize: 14.5,
    lineHeight: 20,
  },
  youRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: spacing.xxl,
  },
  youBubble: {
    borderRadius: radii.card,
    borderBottomRightRadius: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 2,
    flexShrink: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});
