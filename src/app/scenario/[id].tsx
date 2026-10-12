import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Dots } from '@/components/Dots';
import { Glow } from '@/components/Glow';
import { PanicButton } from '@/components/PanicButton';
import { RoundButton } from '@/components/RoundButton';
import { ScenarioArt } from '@/components/ScenarioArt';
import { ScreenHeader } from '@/components/ScreenHeader';
import { DIALOGUE, StoryText } from '@/components/StoryText';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { goBack } from '@/lib/nav';
import {
  artOf,
  DOMAIN_TAG,
  getScenario,
  isOutcome,
  useSaveProgress,
  useScenarioProgress,
  type Choice,
  type Scenario,
} from '@/lib/scenarios';
import { FEATURE_TONE, radii, shades, spacing } from '@/theme';

const copy = strings.scenarios;
const tone = FEATURE_TONE.scenarios;
const L = shades[tone];
const LETTERS = 'ABCDEF';

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

/** The first thing someone else says becomes the speech balloon on the picture; the rest is read below. */
function splitScene(text: string) {
  const lines = text.split('\n');
  const index = lines.findIndex((line) => {
    const match = DIALOGUE.exec(line.trim());
    return match && match[1] !== copy.you;
  });
  if (index < 0) return { balloon: null, rest: text };
  const [, speaker, words] = DIALOGUE.exec(lines[index].trim())!;
  return { balloon: { speaker, words }, rest: lines.filter((_line, at) => at !== index).join('\n') };
}

type PlayerProps = { scenario: Scenario; startNode: string; startPath: string[] };

/**
 * One scene at a time, like a page of a comic: the picture with a speech
 * balloon on top, and a sheet below with the story, your choices, then what
 * happens and why it matters. No scores and no right answers.
 */
function Player({ scenario, startNode, startPath }: PlayerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const pathname = usePathname();
  const save = useSaveProgress();
  const scroll = useRef<ScrollView>(null);

  const [nodeId, setNodeId] = useState(startNode);
  const [path, setPath] = useState(startPath);
  const [chosen, setChosen] = useState<Choice | null>(null);
  const node = scenario.nodes[nodeId];
  const ended = isOutcome(node);

  const decisions = Object.values(scenario.nodes).filter((item) => !isOutcome(item)).length;
  const step = ended ? decisions : Math.min(path.length + (chosen ? 0 : 1), decisions);
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
    toTop();
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

  const scene = ended ? null : splitScene(node.text);
  const balloon = !chosen ? scene?.balloon : null;
  // The picture leads while you are deciding, and steps back once there is more to read.
  const pictureHeight = Math.round(window.height * (chosen || ended ? 0.3 : 0.44));

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <View style={[styles.picture, { height: pictureHeight }]}>
        <ScenarioArt kind={artOf(scenario)} frame="scene" style={StyleSheet.absoluteFill} />
        <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="sceneTopShade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={L[8]} stopOpacity={0.7} />
                <Stop offset="0.45" stopColor={L[8]} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#sceneTopShade)" />
          </Svg>
        </View>

        <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]}>
          <View
            style={styles.segments}
            accessibilityRole="progressbar"
            accessibilityLabel={copy.scene(step, decisions)}
            accessibilityValue={{ min: 0, max: decisions, now: step }}>
            {Array.from({ length: decisions }, (_item, index) => (
              <View key={index} style={[styles.segment, index < step && styles.segmentOn]} />
            ))}
          </View>
          <View style={styles.header}>
            <RoundButton icon={ArrowLeft} label={strings.common.back} onPress={() => goBack(pathname)} />
            <View style={styles.flex} accessibilityRole="header">
              <AppText variant="caption" color={L[0]} numberOfLines={1}>
                {ended ? copy.theEnd : copy.scene(step, decisions)}
              </AppText>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {scenario.title}
              </AppText>
            </View>
            <PanicButton />
          </View>

          {balloon ? (
            <View style={styles.balloon}>
              <AppText variant="strip" color={L[5]}>
                {balloon.speaker.toUpperCase()}
              </AppText>
              <AppText variant="bodyStrong" color={L[8]} numberOfLines={6}>
                {balloon.words}
              </AppText>
              <View style={styles.tail} />
            </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        <Dots />
        <ScrollView ref={scroll} contentContainerStyle={styles.content}>
          {ended ? (
            <>
              <AppText variant="strip" color={L[2]}>
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
            </>
          ) : chosen ? (
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
                <AppText variant="strip" color={L[2]}>
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
            <>
              {scene?.rest.trim() ? <StoryText text={scene.rest} /> : null}
              <View style={styles.block}>
                <AppText variant="strip" color={L[2]} accessibilityRole="header">
                  {copy.choose.toUpperCase()}
                </AppText>
                {node.choices.map((choice, index) => (
                  <Pressable
                    key={choice.label}
                    onPress={() => choose(choice)}
                    accessibilityRole="button"
                    accessibilityLabel={choice.label}
                    style={({ pressed }) => [styles.choice, pressed && { backgroundColor: L[5], borderColor: L[3] }]}>
                    <View style={styles.letter}>
                      <AppText variant="numeral" color={L[7]} style={styles.letterText}>
                        {LETTERS[index] ?? ''}
                      </AppText>
                    </View>
                    <AppText variant="label" style={styles.choiceText}>
                      {choice.label}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        {ended ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
            <Button label={copy.tryAgain} onPress={restart} />
            <Button
              variant="secondary"
              label={copy.talk}
              onPress={() => router.push({ pathname: '/compose', params: { tag: DOMAIN_TAG[scenario.domain] } })}
            />
            <Button variant="text" label={copy.needHelp} onPress={() => router.navigate('/help')} />
          </View>
        ) : chosen ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
            <Button label={copy.continue} onPress={goOn} />
          </View>
        ) : null}
      </View>
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
  missing: {
    textAlign: 'center',
    padding: spacing.xxl,
  },
  picture: {
    backgroundColor: L[5],
  },
  top: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  segmentOn: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  balloon: {
    alignSelf: 'flex-end',
    maxWidth: '78%',
    borderRadius: 22,
    paddingHorizontal: spacing.lg - 2,
    paddingVertical: spacing.md - 1,
    gap: 2,
    backgroundColor: '#FFFFFF',
  },
  tail: {
    position: 'absolute',
    right: 34,
    bottom: -7,
    width: 16,
    height: 16,
    borderBottomRightRadius: 4,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  sheet: {
    flex: 1,
    marginTop: -26,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg + 2,
    paddingTop: spacing.xl - 2,
    gap: spacing.lg,
  },
  dimmed: {
    opacity: 0.88,
  },
  block: {
    gap: spacing.sm + 2,
  },
  choice: {
    minHeight: 54,
    borderRadius: 27,
    paddingLeft: 9,
    paddingRight: spacing.lg,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: L[8],
    borderWidth: 1.3,
    borderColor: L[5],
  },
  letter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: L[1],
  },
  letterText: {
    fontSize: 21,
    lineHeight: 22,
    letterSpacing: 0,
  },
  choiceText: {
    flex: 1,
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
