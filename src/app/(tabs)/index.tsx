import { router } from 'expo-router';
import { ArrowUpRight, Play } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Glow } from '@/components/Glow';
import { Mascot } from '@/components/Mascot';
import { PostCard } from '@/components/PostCard';
import { PostMenu, type MenuTarget } from '@/components/PostMenu';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { SetupCheck } from '@/components/SetupCheck';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useConfessionOfTheDay } from '@/lib/posts';
import { scenarios, statusOf, useScenarioProgress } from '@/lib/scenarios';
import { useQuestionReplies, useSpaces, useWeeklyQuestions } from '@/lib/spaces';
import { FEATURE_TONE, radii, spacing, tileGap, type Feature } from '@/theme';

const copy = strings.home;

/** The three smaller doors under the big one. */
const DOORS: { feature: Exclude<Feature, 'scenarios' | 'profile'>; route: '/confess' | '/spaces' | '/help' }[] = [
  { feature: 'confess', route: '/confess' },
  { feature: 'spaces', route: '/spaces' },
  { feature: 'help', route: '/help' },
];

/**
 * Home asks one question and answers it with four doors, one per section,
 * each in its section's colour with its own character. Scenarios is the big
 * door, because practising is the heart of the app, and it carries today's
 * scenario. What's new this week sits quietly underneath.
 */
export default function HomeScreen() {
  const theme = useTheme();
  const progress = useScenarioProgress();
  const spaces = useSpaces();
  const questions = useWeeklyQuestions();
  const featured = useConfessionOfTheDay();
  const [menu, setMenu] = useState<MenuTarget | null>(null);

  // The scenario to offer: one you're in the middle of, else the first you haven't tried.
  const inProgress = scenarios.find((item) => statusOf(progress.data?.[item.id]) === 'in_progress');
  const scenario = inProgress ?? scenarios.find((item) => statusOf(progress.data?.[item.id]) === 'new') ?? scenarios[0];

  // The pinned question of a space you joined, else of the first space.
  const space = spaces.data?.find((item) => questions.data?.[item.id]);
  const question = space ? questions.data?.[space.id] : undefined;

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppText variant="display" accessibilityRole="header" style={styles.ask}>
        {copy.ask}
      </AppText>

      {scenario ? (
        <Glow
          tone={FEATURE_TONE.scenarios}
          style={styles.hero}
          accessibilityLabel={`${strings.tabs.scenarios}. ${copy.doors.scenarios}. ${copy.today(scenario.title)}`}
          onPress={() => router.push({ pathname: '/scenario/[id]', params: { id: scenario.id } })}>
          <View style={styles.heroMascot}>
            <Mascot feature="scenarios" size={116} />
          </View>
          <AppText variant="strip" style={styles.eyebrow}>
            {strings.tabs.scenarios.toUpperCase()}
          </AppText>
          <AppText variant="display" style={styles.heroTitle}>
            {copy.doors.scenarios}
          </AppText>
          <View style={[styles.todayPill, { backgroundColor: theme.wash }]}>
            <AppText variant="caption" numberOfLines={1}>
              {inProgress ? copy.continueWith(scenario.title) : copy.today(scenario.title)}
            </AppText>
          </View>
          <View style={styles.heroFoot}>
            <View style={styles.baseline}>
              <AppText variant="numeral">03</AppText>
              <AppText variant="label">{strings.scenarios.statMinutes}</AppText>
            </View>
            <View style={[styles.cta, { backgroundColor: theme.primary }]}>
              <Play size={14} color={theme.onPrimary} fill={theme.onPrimary} />
              <AppText variant="bodyStrong" color={theme.onPrimary}>
                {inProgress ? copy.continue : strings.scenarios.play}
              </AppText>
            </View>
          </View>
        </Glow>
      ) : null}

      <View style={styles.doors}>
        {DOORS.map(({ feature, route }) => (
          <View key={feature} style={styles.doorCell}>
            <Glow
              tone={FEATURE_TONE[feature]}
              style={styles.door}
              accessibilityLabel={`${strings.tabs[feature]}. ${copy.doors[feature]}`}
              onPress={() => router.navigate(route)}>
              <AppText variant="strip" style={styles.eyebrow}>
                {strings.tabs[feature].toUpperCase()}
              </AppText>
              <AppText variant="bodyStrong" style={styles.doorTitle}>
                {copy.doors[feature]}
              </AppText>
              <View style={styles.doorMascot}>
                <Mascot feature={feature} size={54} />
              </View>
            </Glow>
          </View>
        ))}
      </View>

      {question && space ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${question.question}. ${strings.spaces.answerThis}`}
          onPress={() => router.push({ pathname: '/question/[id]', params: { id: question.id } })}>
          <Card style={styles.week}>
            <Mascot feature="spaces" size={40} />
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{question.question}</AppText>
              <WeekMeta questionId={question.id} />
            </View>
            <ArrowUpRight size={18} color={theme.textSecondary} />
          </Card>
        </PressableScale>
      ) : null}

      {featured.data ? (
        <>
          <AppText variant="heading" accessibilityRole="header" style={styles.sectionTitle}>
            {copy.confessionTitle}
          </AppText>
          <PostCard
            post={featured.data}
            onOpen={() => router.push({ pathname: '/post/[id]', params: { id: featured.data!.id } })}
            onMenu={() =>
              setMenu({
                targetType: 'post',
                id: featured.data!.id,
                isMine: featured.data!.is_mine,
                isSaved: featured.data!.is_saved,
              })
            }
          />
        </>
      ) : null}

      {__DEV__ ? <SetupCheck /> : null}
      <PostMenu target={menu} onClose={() => setMenu(null)} />
    </Screen>
  );
}

/** "This week in Spaces · 42 answers" */
function WeekMeta({ questionId }: { questionId: string }) {
  const theme = useTheme();
  const answers = useQuestionReplies(questionId).data?.filter((reply) => reply.status === 'approved').length ?? 0;
  return (
    <AppText variant="caption" color={theme.textSecondary}>
      {copy.weekInSpaces(answers)}
    </AppText>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: tileGap,
    paddingTop: spacing.xs,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  ask: {
    fontSize: 25,
    lineHeight: 27,
    marginBottom: spacing.xs,
  },
  hero: {
    minHeight: 204,
  },
  heroMascot: {
    position: 'absolute',
    right: -6,
    top: 18,
    transform: [{ rotate: '6deg' }],
  },
  eyebrow: {
    opacity: 0.9,
  },
  heroTitle: {
    paddingRight: 108,
  },
  todayPill: {
    alignSelf: 'flex-start',
    maxWidth: '72%',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginTop: 2,
  },
  heroFoot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  baseline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  cta: {
    height: 42,
    paddingHorizontal: spacing.lg + 2,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doors: {
    flexDirection: 'row',
    gap: tileGap,
  },
  doorCell: {
    flex: 1,
  },
  door: {
    minHeight: 168,
    padding: spacing.md,
    gap: spacing.xs,
  },
  doorTitle: {
    fontSize: 14,
    lineHeight: 17,
  },
  doorMascot: {
    position: 'absolute',
    right: -8,
    bottom: -8,
  },
  week: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: 2,
  },
});
