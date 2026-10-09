import { router } from 'expo-router';
import { EyeOff, LifeBuoy } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PostCard } from '@/components/PostCard';
import { PostMenu, type MenuTarget } from '@/components/PostMenu';
import { QuestionCard } from '@/components/QuestionCard';
import { Screen } from '@/components/Screen';
import { SetupCheck } from '@/components/SetupCheck';
import { Starburst } from '@/components/Starburst';
import { Tile } from '@/components/Tile';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useConfessionOfTheDay } from '@/lib/posts';
import { scenarios, statusOf, useScenarioProgress } from '@/lib/scenarios';
import { useSpaces, useWeeklyQuestions } from '@/lib/spaces';
import { spacing, tileGap } from '@/theme';

const copy = strings.home;

export default function HomeScreen() {
  const theme = useTheme();
  const progress = useScenarioProgress();
  const spaces = useSpaces();
  const questions = useWeeklyQuestions();
  const featured = useConfessionOfTheDay();
  const [menu, setMenu] = useState<MenuTarget | null>(null);

  // The scenario to offer: one you're in the middle of, else the first you haven't tried.
  const inProgress = scenarios.find((item) => statusOf(progress.data?.[item.id]) === 'in_progress');
  const scenario = inProgress ?? scenarios.find((item) => statusOf(progress.data?.[item.id]) === 'new');

  // The pinned question of a space you joined, else of the first space.
  const space = spaces.data?.find((item) => questions.data?.[item.id]);
  const question = space ? questions.data?.[space.id] : undefined;

  return (
    <Screen>
      {/* The tiles sit close together so they read as one interlocking shape. */}
      <View style={styles.puzzle}>
        {scenario ? (
          <Tile
            tone="yellow"
            arrow
            accessibilityLabel={`${inProgress ? copy.continueTitle : copy.startTitle}: ${scenario.title}`}
            onPress={() => router.push({ pathname: '/scenario/[id]', params: { id: scenario.id } })}>
            <View style={styles.star}>
              <Starburst size={64} fill={theme.ink} points={8} inner={0.16} />
            </View>
            <AppText variant="script" color={theme.ink}>
              {inProgress ? copy.continueTitle : copy.startTitle}
            </AppText>
            <AppText variant="display" color={theme.ink} style={styles.scenarioTitle}>
              {scenario.title}
            </AppText>
            <AppText color={theme.ink} style={styles.scenarioHook}>
              {scenario.hook}
            </AppText>
          </Tile>
        ) : null}

        {question && space ? (
          <QuestionCard question={question} label={`${copy.questionTitle} · ${space.name}`} />
        ) : null}

        <View style={styles.pair}>
          <View style={styles.half}>
            <Tile tone="green" style={styles.fill}>
              <EyeOff size={24} color={theme.ink} />
              <AppText variant="bodyStrong" color={theme.ink}>
                {copy.anonymousTitle}
              </AppText>
              <AppText variant="label" color={theme.ink}>
                {copy.anonymousShort}
              </AppText>
            </Tile>
          </View>
          <View style={styles.half}>
            <Tile
              tone="blue"
              style={styles.fill}
              accessibilityLabel={copy.helpTitle}
              onPress={() => router.navigate('/help')}>
              <LifeBuoy size={24} color={theme.ink} />
              <AppText variant="bodyStrong" color={theme.ink}>
                {copy.helpTitle}
              </AppText>
              <AppText variant="label" color={theme.ink}>
                {copy.helpShort}
              </AppText>
            </Tile>
          </View>
        </View>
      </View>

      {featured.data ? (
        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
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
        </View>
      ) : null}

      {__DEV__ ? <SetupCheck /> : null}
      <PostMenu target={menu} onClose={() => setMenu(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  puzzle: {
    gap: tileGap,
  },
  star: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  scenarioTitle: {
    paddingRight: 64,
  },
  scenarioHook: {
    paddingRight: spacing.xxl,
  },
  pair: {
    flexDirection: 'row',
    gap: tileGap,
  },
  half: {
    flex: 1,
  },
  fill: {
    flexGrow: 1,
    minHeight: 150,
  },
  section: {
    gap: spacing.md,
  },
});
