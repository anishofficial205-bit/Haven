import { router } from 'expo-router';
import { ArrowRight, Check } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Glow } from '@/components/Glow';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { FALLBACK_SPACE_ICON, SPACE_ICONS } from '@/lib/icons';
import { useSpaces, useToggleMembership, useWeeklyQuestions, type Space, type WeeklyQuestion } from '@/lib/spaces';
import { FEATURE_TONE, radii, shades, spacing, tileGap } from '@/theme';

const copy = strings.spaces;
const L = shades[FEATURE_TONE.spaces];
const GAP = spacing.sm + 2;

const openSpace = (space: Space) => router.push({ pathname: '/space/[id]', params: { id: space.id } });

/** Your spaces as tall cards to swipe through, then every space as a pill you can join. */
export default function SpacesScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const spaces = useSpaces();
  const questions = useWeeklyQuestions();
  const [page, setPage] = useState(0);

  const all = spaces.data ?? [];
  const joined = all.filter((space) => space.joined);
  // Narrower than the screen, so the next card peeks in and invites a swipe.
  const cardWidth = Math.min(width, 520) - spacing.lg * 2 - (joined.length > 1 ? 52 : 0);

  return (
    <Screen contentContainerStyle={styles.content}>
      {spaces.isPending ? <ActivityIndicator color={L[1]} /> : null}
      {spaces.isError ? <AppText color={theme.danger}>{strings.common.genericError}</AppText> : null}

      {spaces.data ? <Heading title={copy.yours} count={joined.length} /> : null}
      {joined.length > 0 ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + GAP}
            decelerationRate="fast"
            scrollEventThrottle={32}
            onScroll={(event) => setPage(Math.round(event.nativeEvent.contentOffset.x / (cardWidth + GAP)))}
            style={styles.bleed}
            contentContainerStyle={styles.doors}>
            {joined.map((space) => (
              <Door key={space.id} space={space} question={questions.data?.[space.id]} width={cardWidth} />
            ))}
          </ScrollView>
          {joined.length > 1 ? (
            <View style={styles.pips} accessibilityLabel={copy.cardOf(page + 1, joined.length)}>
              {joined.map((space, index) => (
                <View key={space.id} style={[styles.pip, index === page && styles.pipOn]} />
              ))}
            </View>
          ) : null}
        </>
      ) : spaces.data ? (
        <View style={styles.none}>
          <AppText variant="label" color={L[1]}>
            {copy.noneJoined}
          </AppText>
        </View>
      ) : null}

      {spaces.data ? <Heading title={copy.all} count={all.length} /> : null}
      <View style={styles.list}>
        {[...all]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((space) => (
            <Pill key={space.id} space={space} />
          ))}
      </View>
    </Screen>
  );
}

function Heading({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.heading}>
      <AppText variant="strip" color={L[2]} accessibilityRole="header" style={styles.flex}>
        {title.toUpperCase()}
      </AppText>
      <AppText variant="numeral" color={L[2]} style={styles.count}>
        {String(count).padStart(2, '0')}
      </AppText>
    </View>
  );
}

/** One of your spaces, big: what it is, this week's question, and the way in. */
function Door({ space, question, width }: { space: Space; question?: WeeklyQuestion; width: number }) {
  const theme = useTheme();
  const Icon = SPACE_ICONS[space.slug] ?? FALLBACK_SPACE_ICON;
  return (
    <Glow tone={FEATURE_TONE.spaces} style={[styles.door, { width }]}>
      <Pressable
        onPress={() => openSpace(space)}
        accessibilityRole="button"
        accessibilityLabel={`${space.name}. ${space.description}`}
        style={styles.doorTop}>
        <View style={[styles.doorIcon, { backgroundColor: theme.wash }]}>
          <Icon size={24} color="#FFFFFF" />
        </View>
        <View style={styles.doorName}>
          <AppText variant="display">{space.name}</AppText>
          <AppText variant="label" color={L[0]}>
            {space.description}
          </AppText>
        </View>
      </Pressable>

      {question ? (
        <Pressable
          onPress={() => router.push({ pathname: '/question/[id]', params: { id: question.id } })}
          accessibilityRole="button"
          accessibilityLabel={`${copy.weekly}: ${question.question}`}
          style={styles.week}>
          <AppText variant="strip" color={L[1]}>
            {copy.thisWeek.toUpperCase()}
          </AppText>
          <AppText variant="label" numberOfLines={3}>
            {question.question}
          </AppText>
        </Pressable>
      ) : null}

      <View style={styles.doorFoot}>
        <View style={styles.joinedTag}>
          <Check size={14} color={L[7]} strokeWidth={2.6} />
          <AppText variant="label" color={L[7]}>
            {copy.joined}
          </AppText>
        </View>
        <PressableScale
          onPress={() => openSpace(space)}
          accessibilityRole="button"
          accessibilityLabel={`${copy.enter} ${space.name}`}
          style={[styles.enter, { backgroundColor: theme.primary }]}>
          <AppText variant="label" color={theme.onPrimary}>
            {copy.enter}
          </AppText>
          <ArrowRight size={15} color={theme.onPrimary} />
        </PressableScale>
      </View>
    </Glow>
  );
}

/** A space in the full list: tap the pill to look inside, or join right here. */
function Pill({ space }: { space: Space }) {
  const toggle = useToggleMembership();
  const Icon = SPACE_ICONS[space.slug] ?? FALLBACK_SPACE_ICON;
  return (
    <View style={styles.pill}>
      <Pressable
        onPress={() => openSpace(space)}
        accessibilityRole="button"
        accessibilityLabel={`${space.name}. ${space.description}`}
        style={styles.pillOpen}>
        <View style={styles.pillIcon}>
          <Icon size={20} color="#FFFFFF" />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {space.name}
          </AppText>
          <AppText variant="caption" color={L[2]} numberOfLines={2} style={styles.pillLine}>
            {space.description}
          </AppText>
        </View>
      </Pressable>
      <Pressable
        onPress={() => toggle.mutate({ spaceId: space.id, joined: space.joined })}
        accessibilityRole="button"
        accessibilityLabel={`${space.joined ? copy.leave : copy.join} ${space.name}`}
        accessibilityState={{ selected: space.joined }}
        hitSlop={8}
        style={[styles.join, space.joined && { backgroundColor: L[1], borderColor: L[1] }]}>
        {space.joined ? <Check size={14} color={L[7]} strokeWidth={2.6} /> : null}
        <AppText variant="label" color={space.joined ? L[7] : L[0]}>
          {space.joined ? copy.joined : copy.join}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  count: {
    fontSize: 18,
    lineHeight: 18,
  },
  bleed: {
    marginHorizontal: -spacing.lg,
    flexGrow: 0,
  },
  doors: {
    paddingHorizontal: spacing.lg,
    gap: GAP,
  },
  door: {
    minHeight: 318,
    borderRadius: 30,
    padding: spacing.lg + 2,
    gap: spacing.md,
  },
  doorTop: {
    flex: 1,
    gap: spacing.md,
  },
  doorIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doorName: {
    marginTop: 'auto',
    gap: 6,
  },
  week: {
    borderRadius: radii.chip + 6,
    padding: spacing.md,
    gap: 4,
    backgroundColor: 'rgba(8, 14, 54, 0.42)',
  },
  doorFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  joinedTag: {
    height: 36,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: L[1],
  },
  enter: {
    height: 40,
    paddingHorizontal: spacing.lg + 2,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pips: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  pip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: L[6],
  },
  pipOn: {
    width: 20,
    backgroundColor: L[1],
  },
  none: {
    borderRadius: radii.card,
    padding: spacing.lg,
    backgroundColor: L[8],
    borderWidth: 1,
    borderColor: L[6],
  },
  list: {
    gap: tileGap,
  },
  pill: {
    minHeight: 72,
    borderRadius: 36,
    padding: 7,
    paddingRight: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: L[8],
    borderWidth: 1,
    borderColor: L[6],
  },
  pillOpen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pillIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: L[5],
  },
  pillLine: {
    opacity: 0.85,
    marginTop: 1,
  },
  join: {
    height: 36,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.3,
    borderColor: L[3],
  },
});
