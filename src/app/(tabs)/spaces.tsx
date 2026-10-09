import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Glow } from '@/components/Glow';
import { QuestionCard } from '@/components/QuestionCard';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useSpaces, useToggleMembership, useWeeklyQuestions, type Space } from '@/lib/spaces';
import { FEATURE_TONE, radii, spacing, tileGap } from '@/theme';

const copy = strings.spaces;

export default function SpacesScreen() {
  const theme = useTheme();
  const spaces = useSpaces();
  const questions = useWeeklyQuestions();
  const toggle = useToggleMembership();

  const joined = spaces.data?.filter((space) => space.joined) ?? [];
  const others = spaces.data?.filter((space) => !space.joined) ?? [];
  // Lead with the question of a space you joined, else of the first space.
  const lead = spaces.data?.find((space) => questions.data?.[space.id]);
  const question = lead ? questions.data?.[lead.id] : undefined;

  const section = (title: string, list: Space[]) =>
    list.length === 0 ? null : (
      <>
        <View style={styles.sectionTitle}>
          <AppText variant="heading" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="numeral" color={theme.primary} style={styles.sectionCount}>
            {String(list.length).padStart(2, '0')}
          </AppText>
        </View>
        <View style={styles.grid}>
          {list.map((space, index) => (
            <View key={space.id} style={styles.cell}>
              {/* The card and its Join button are separate controls, side by side inside the glow. */}
              <Glow tone={FEATURE_TONE.spaces} light={index % 2 === 0 ? 'left' : 'right'} style={styles.space}>
                <Pressable
                  style={styles.open}
                  accessibilityRole="button"
                  accessibilityLabel={`${space.name}. ${space.description}`}
                  onPress={() => router.push({ pathname: '/space/[id]', params: { id: space.id } })}>
                  <AppText variant="heading">{space.name}</AppText>
                  <AppText variant="caption" style={styles.description}>
                    {space.description}
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={() => toggle.mutate({ spaceId: space.id, joined: space.joined })}
                  accessibilityRole="button"
                  accessibilityLabel={`${space.joined ? copy.leave : copy.join} ${space.name}`}
                  hitSlop={8}
                  style={[
                    styles.join,
                    space.joined
                      ? { backgroundColor: theme.primary }
                      : { backgroundColor: theme.wash, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)' },
                  ]}>
                  <AppText variant="label" color={space.joined ? theme.onPrimary : theme.text}>
                    {space.joined ? copy.joined : copy.join}
                  </AppText>
                </Pressable>
              </Glow>
            </View>
          ))}
        </View>
      </>
    );

  return (
    <Screen contentContainerStyle={styles.content}>
      {question && lead ? <QuestionCard question={question} spaceName={lead.name} /> : null}
      {spaces.isPending ? <ActivityIndicator color={theme.primary} /> : null}
      {spaces.isError ? <AppText color={theme.danger}>{strings.common.genericError}</AppText> : null}
      {section(copy.yours, joined)}
      {section(joined.length > 0 ? copy.more : copy.all, others)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.sm,
    gap: tileGap,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: 2,
  },
  sectionCount: {
    fontSize: 20,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tileGap,
  },
  cell: {
    width: '48.8%',
  },
  space: {
    minHeight: 150,
    gap: spacing.xs,
  },
  open: {
    flex: 1,
    gap: spacing.xs,
  },
  description: {
    opacity: 0.9,
  },
  join: {
    alignSelf: 'flex-end',
    height: 30,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.pill,
    justifyContent: 'center',
  },
});
