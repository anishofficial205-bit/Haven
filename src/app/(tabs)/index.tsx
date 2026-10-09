import { router } from 'expo-router';
import { EyeOff, LifeBuoy } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PostCard } from '@/components/PostCard';
import { PostMenu, type MenuTarget } from '@/components/PostMenu';
import { QuestionCard } from '@/components/QuestionCard';
import { ScenarioCard } from '@/components/ScenarioCard';
import { Screen } from '@/components/Screen';
import { SetupCheck } from '@/components/SetupCheck';
import { Tile } from '@/components/Tile';
import { strings } from '@/i18n/en';
import { useConfessionOfTheDay } from '@/lib/posts';
import { scenarios, statusOf, useScenarioProgress } from '@/lib/scenarios';
import { useSpaces, useWeeklyQuestions } from '@/lib/spaces';
import { paperPalette, spacing, tileGap } from '@/theme';

const copy = strings.home;
const ink = paperPalette.ink;

export default function HomeScreen() {
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
    <Screen contentContainerStyle={styles.content}>
      {/* The tiles sit close together so they read as one interlocking shape. */}
      <View style={styles.puzzle}>
        {scenario ? (
          <ScenarioCard scenario={scenario} progress={progress.data?.[scenario.id]} tone="mint" />
        ) : null}

        {question && space ? <QuestionCard question={question} spaceName={space.name} /> : null}

        <View style={styles.pair}>
          <View style={styles.wide}>
            <Tile tone="rose" style={styles.fill}>
              <EyeOff size={22} color={ink} />
              <AppText variant="bodyStrong">{copy.anonymousTitle}</AppText>
              <AppText variant="label">{copy.anonymousShort}</AppText>
            </Tile>
          </View>
          <View style={styles.narrow}>
            <Tile
              tone="sky"
              style={styles.fill}
              accessibilityLabel={copy.helpTitle}
              onPress={() => router.navigate('/help')}>
              <LifeBuoy size={22} color={ink} />
              <AppText variant="bodyStrong">{copy.helpTitle}</AppText>
              <AppText variant="label">{copy.helpShort}</AppText>
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
  content: {
    paddingTop: tileGap,
  },
  puzzle: {
    gap: tileGap,
  },
  pair: {
    flexDirection: 'row',
    gap: tileGap,
  },
  wide: {
    flex: 1.15,
  },
  narrow: {
    flex: 1,
  },
  fill: {
    flexGrow: 1,
    minHeight: 140,
  },
  section: {
    gap: spacing.md,
  },
});
