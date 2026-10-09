import { router } from 'expo-router';
import { EyeOff, LifeBuoy } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PostCard } from '@/components/PostCard';
import { PostMenu, type MenuTarget } from '@/components/PostMenu';
import { QuestionCard } from '@/components/QuestionCard';
import { Screen } from '@/components/Screen';
import { SetupCheck } from '@/components/SetupCheck';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { DOMAIN_ICONS } from '@/lib/icons';
import { useConfessionOfTheDay } from '@/lib/posts';
import { scenarios, statusOf, useScenarioProgress } from '@/lib/scenarios';
import { useSpaces, useWeeklyQuestions } from '@/lib/spaces';
import { radii, spacing } from '@/theme';

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
  const ScenarioIcon = scenario ? DOMAIN_ICONS[scenario.domain] : null;

  // The pinned question of a space you joined, else of the first space.
  const space = spaces.data?.find((item) => questions.data?.[item.id]);
  const question = space ? questions.data?.[space.id] : undefined;

  return (
    <Screen>
      {scenario && ScenarioIcon ? (
        <Card>
          <AppText variant="label" color={theme.textSecondary}>
            {inProgress ? copy.continueTitle : copy.startTitle}
          </AppText>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: theme.surfaceAlt }]}>
              <ScenarioIcon size={24} color={theme.primary} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{scenario.title}</AppText>
              <AppText color={theme.textSecondary}>{scenario.hook}</AppText>
            </View>
          </View>
          <Button
            label={inProgress ? copy.continue : copy.start}
            onPress={() => router.push({ pathname: '/scenario/[id]', params: { id: scenario.id } })}
          />
        </Card>
      ) : null}

      {question && space ? <QuestionCard question={question} label={`${copy.questionTitle} · ${space.name}`} /> : null}

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

      <Card style={{ backgroundColor: theme.surfaceAlt }}>
        <View style={styles.row}>
          <EyeOff size={24} color={theme.primary} />
          <AppText variant="bodyStrong" style={styles.flex}>
            {copy.anonymousTitle}
          </AppText>
        </View>
        <AppText color={theme.textSecondary}>{copy.anonymousBody}</AppText>
      </Card>

      <Pressable accessibilityRole="button" onPress={() => router.navigate('/help')}>
        <Card>
          <View style={styles.row}>
            <LifeBuoy size={24} color={theme.primary} />
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{copy.helpTitle}</AppText>
              <AppText color={theme.textSecondary}>{copy.helpBody}</AppText>
            </View>
          </View>
        </Card>
      </Pressable>

      {__DEV__ ? <SetupCheck /> : null}
      <PostMenu target={menu} onClose={() => setMenu(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radii.chip + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
