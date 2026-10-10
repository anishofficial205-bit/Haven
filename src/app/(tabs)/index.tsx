import { router } from 'expo-router';
import { ArrowUpRight, Play } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AnonymousAvatar } from '@/components/AnonymousAvatar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Glow } from '@/components/Glow';
import { Mascot } from '@/components/Mascot';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { SetupCheck } from '@/components/SetupCheck';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useConfessionFeed, useConfessionOfTheDay, type PostCard } from '@/lib/posts';
import { scenarios, statusOf, useScenarioProgress } from '@/lib/scenarios';
import { useQuestionReplies, useSpaces, useWeeklyQuestions, type WeeklyQuestion } from '@/lib/spaces';
import { FEATURE_TONE, radii, spacing, type Feature } from '@/theme';

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
 * door, because practising is the heart of the app. Underneath, two quiet
 * rows show what's new: this week's question and the confession of the day.
 */
export default function HomeScreen() {
  const theme = useTheme();
  const progress = useScenarioProgress();
  const spaces = useSpaces();
  const questions = useWeeklyQuestions();
  const pinned = useConfessionOfTheDay();
  const supported = useConfessionFeed(null, 'supported');

  // The scenario to offer: one you're in the middle of, else the first you haven't tried.
  const inProgress = scenarios.find((item) => statusOf(progress.data?.[item.id]) === 'in_progress');
  const scenario = inProgress ?? scenarios.find((item) => statusOf(progress.data?.[item.id]) === 'new') ?? scenarios[0];

  // The pinned question of a space you joined, else of the first space.
  const space = spaces.data?.find((item) => questions.data?.[item.id]);
  const question = space ? questions.data?.[space.id] : undefined;

  // The confession a moderator pinned for today; until one is pinned, the most supported one.
  const confession = pinned.data ?? supported.data?.find((post) => post.status === 'published') ?? null;

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
            <Mascot feature="scenarios" size={112} />
          </View>
          <AppText variant="strip" style={styles.eyebrow}>
            {strings.tabs.scenarios.toUpperCase()}
          </AppText>
          <AppText variant="display" style={styles.heroTitle}>
            {copy.doors.scenarios}
          </AppText>
          <View style={styles.heroFoot}>
            <AppText variant="label" numberOfLines={2} style={styles.heroToday}>
              {inProgress ? copy.continueWith(scenario.title) : copy.today(scenario.title)}
            </AppText>
            <View style={[styles.cta, { backgroundColor: theme.primary }]}>
              <Play size={13} color={theme.onPrimary} fill={theme.onPrimary} />
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
                <Mascot feature={feature} size={50} />
              </View>
            </Glow>
          </View>
        ))}
      </View>

      {question ? <WeekRow question={question} /> : null}
      {confession ? <ConfessionRow post={confession} /> : null}

      {__DEV__ ? <SetupCheck /> : null}
    </Screen>
  );
}

/** This week's question from Spaces, as a quiet row. */
function WeekRow({ question }: { question: WeeklyQuestion }) {
  const theme = useTheme();
  const answers = useQuestionReplies(question.id).data?.filter((reply) => reply.status === 'approved').length ?? 0;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${copy.weekTitle}. ${question.question}. ${strings.spaces.answerThis}`}
      onPress={() => router.push({ pathname: '/question/[id]', params: { id: question.id } })}>
      <Card style={styles.row}>
        <View style={styles.rowHead}>
          <Mascot feature="spaces" size={26} />
          <AppText variant="strip" color={theme.textSecondary} style={styles.flex}>
            {copy.weekTitle.toUpperCase()}
          </AppText>
          <ArrowUpRight size={16} color={theme.textSecondary} />
        </View>
        <AppText variant="bodyStrong">{question.question}</AppText>
        <AppText variant="caption" color={theme.textSecondary}>
          {strings.spaces.answers(answers)}
        </AppText>
      </Card>
    </PressableScale>
  );
}

/** The confession of the day, as a quiet row. Tapping opens the full post. */
function ConfessionRow({ post }: { post: PostCard }) {
  const theme = useTheme();
  // A post with trigger warnings never shows its words here: only what it mentions.
  const gated = post.trigger_warnings.length > 0 && !post.is_mine;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${copy.confessionTitle}. ${strings.post.openPost}`}
      onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}>
      <Card style={styles.row}>
        <View style={styles.rowHead}>
          <AnonymousAvatar size={26} tone={FEATURE_TONE.confess} />
          <AppText variant="strip" color={theme.textSecondary} style={styles.flex}>
            {copy.confessionTitle.toUpperCase()}
          </AppText>
          <ArrowUpRight size={16} color={theme.textSecondary} />
        </View>
        {gated ? (
          <View style={styles.warnings}>
            <AppText variant="label" color={theme.textSecondary}>
              {strings.post.warningTitle}
            </AppText>
            {post.trigger_warnings.map((warning) => (
              <Chip key={warning} tone="warning" label={strings.triggerWarnings[warning]} />
            ))}
          </View>
        ) : (
          <AppText color="#F2F2F6" numberOfLines={4}>
            {post.body}
          </AppText>
        )}
        <AppText variant="caption" color={theme.textSecondary}>
          {copy.confessionMeta(post.reaction_total, post.reply_count)}
        </AppText>
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  ask: {
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -1.4,
    marginBottom: spacing.xs,
  },
  hero: {
    minHeight: 184,
    padding: spacing.lg,
  },
  heroMascot: {
    position: 'absolute',
    right: -4,
    top: 12,
    transform: [{ rotate: '6deg' }],
  },
  eyebrow: {
    opacity: 0.9,
  },
  heroTitle: {
    paddingRight: 104,
  },
  heroFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
  heroToday: {
    flex: 1,
    opacity: 0.95,
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
    gap: spacing.sm + 2,
  },
  doorCell: {
    flex: 1,
  },
  door: {
    minHeight: 150,
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
  row: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  warnings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
});
