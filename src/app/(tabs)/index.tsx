import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Glow } from '@/components/Glow';
import { Asterisk, Ring } from '@/components/Objects';
import { PostCard } from '@/components/PostCard';
import { PostMenu, type MenuTarget } from '@/components/PostMenu';
import { QuestionCard } from '@/components/QuestionCard';
import { Screen } from '@/components/Screen';
import { SetupCheck } from '@/components/SetupCheck';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useConfessionOfTheDay } from '@/lib/posts';
import { scenarios, statusOf, useScenarioProgress } from '@/lib/scenarios';
import { useSpaces, useWeeklyQuestions } from '@/lib/spaces';
import { FEATURE_TONE, radii, spacing, tileGap } from '@/theme';

const copy = strings.home;

/**
 * Home shows every area of the app as one block in that area's colour:
 * lilac for scenarios, blue for spaces, pink for confessions, mint for help,
 * orange for you.
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
  const played = Object.values(progress.data ?? {}).filter((item) => item.completed_at).length;

  // The pinned question of a space you joined, else of the first space.
  const space = spaces.data?.find((item) => questions.data?.[item.id]);
  const question = space ? questions.data?.[space.id] : undefined;

  return (
    <Screen contentContainerStyle={styles.content}>
      {scenario ? (
        <Glow
          tone={FEATURE_TONE.scenarios}
          style={styles.hero}
          accessibilityLabel={`${inProgress ? copy.continueTitle : copy.startTitle}: ${scenario.title}`}
          onPress={() => router.push({ pathname: '/scenario/[id]', params: { id: scenario.id } })}>
          <View style={styles.asterisk}>
            <Asterisk size={128} />
          </View>
          <AppText variant="strip" style={styles.dimmed}>
            {(inProgress ? copy.continueTitle : copy.daily).toUpperCase()}
          </AppText>
          <AppText variant="display" style={styles.heroTitle}>
            {scenario.title}
          </AppText>
          <View style={styles.heroFoot}>
            <View style={styles.baseline}>
              <AppText variant="numeral">03</AppText>
              <AppText variant="label">{strings.scenarios.statMinutes}</AppText>
            </View>
            <View style={[styles.cta, { backgroundColor: theme.primary }]}>
              <AppText variant="bodyStrong" color={theme.onPrimary}>
                {inProgress ? copy.continue : copy.start}
              </AppText>
            </View>
          </View>
        </Glow>
      ) : null}

      <AppText variant="heading" accessibilityRole="header" style={styles.sectionTitle}>
        {copy.forYou}
      </AppText>

      <View style={styles.grid}>
        <View style={styles.left}>
          {question && space ? (
            <QuestionCard question={question} spaceName={space.name} tall />
          ) : (
            <Glow tone={FEATURE_TONE.spaces} style={styles.fill} onPress={() => router.navigate('/spaces')}>
              <AppText variant="strip" style={styles.dimmed}>
                {strings.tabs.spaces.toUpperCase()}
              </AppText>
              <AppText variant="heading">{strings.header.eyebrows.spaces}</AppText>
            </Glow>
          )}
        </View>
        <View style={styles.right}>
          <Glow
            tone={FEATURE_TONE.confess}
            light="right"
            style={styles.fill}
            accessibilityLabel={strings.feed.compose}
            onPress={() => router.push('/compose')}>
            <View style={styles.ring}>
              <Ring size={66} />
            </View>
            <AppText variant="strip" style={styles.dimmed}>
              {strings.tabs.confess.toUpperCase()}
            </AppText>
            <AppText variant="heading">{copy.sayIt}</AppText>
            <AppText variant="caption">{strings.post.anonymous}</AppText>
          </Glow>
          <Glow
            tone={FEATURE_TONE.help}
            style={styles.help}
            accessibilityLabel={copy.helpTitle}
            onPress={() => router.navigate('/help')}>
            <View style={[styles.sos, { backgroundColor: theme.primary }]}>
              <AppText variant="caption" color={theme.onPrimary} style={styles.sosText}>
                SOS
              </AppText>
            </View>
            <AppText variant="bodyStrong">{strings.tabs.help}</AppText>
          </Glow>
        </View>
      </View>

      <Glow
        tone={FEATURE_TONE.profile}
        style={styles.you}
        accessibilityLabel={strings.header.openProfile}
        onPress={() => router.push('/profile')}>
        <View style={styles.flex}>
          <AppText variant="strip" style={styles.dimmed}>
            {copy.you.toUpperCase()}
          </AppText>
          <AppText variant="bodyStrong">{copy.youBody}</AppText>
        </View>
        <View style={styles.baseline}>
          <AppText variant="numeral">{String(played).padStart(2, '0')}</AppText>
          <AppText variant="label">{strings.profile.statScenarios}</AppText>
        </View>
      </Glow>

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

const styles = StyleSheet.create({
  content: {
    gap: tileGap,
    paddingTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  hero: {
    minHeight: 168,
  },
  asterisk: {
    position: 'absolute',
    right: -16,
    top: -14,
  },
  dimmed: {
    opacity: 0.88,
  },
  heroTitle: {
    paddingRight: 96,
  },
  heroFoot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
  baseline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  cta: {
    height: 42,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    justifyContent: 'center',
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: 2,
  },
  grid: {
    flexDirection: 'row',
    gap: tileGap,
    minHeight: 236,
  },
  left: {
    flex: 1.25,
  },
  right: {
    flex: 1,
    gap: tileGap,
  },
  fill: {
    flex: 1,
  },
  ring: {
    position: 'absolute',
    right: -18,
    bottom: -18,
  },
  help: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  sos: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
  },
  you: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
