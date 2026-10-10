import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Glow } from '@/components/Glow';
import { Mascot } from '@/components/Mascot';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useQuestionReplies, type WeeklyQuestion } from '@/lib/spaces';
import { FEATURE_TONE, radii, spacing } from '@/theme';

type Props = {
  question: WeeklyQuestion;
  /** The space it belongs to */
  spaceName?: string;
  /** Fill the height of a grid cell (used on Home) */
  tall?: boolean;
};

/** The pinned weekly question, in the Spaces colour. Shown at the top of its space and on Home. */
export function QuestionCard({ question, spaceName, tall }: Props) {
  const theme = useTheme();
  const answers = useQuestionReplies(question.id).data?.filter((reply) => reply.status === 'approved').length ?? 0;
  return (
    <Glow
      tone={FEATURE_TONE.spaces}
      style={tall ? styles.tall : undefined}
      accessibilityLabel={`${question.question}. ${strings.spaces.answerThis}`}
      onPress={() => router.push({ pathname: '/question/[id]', params: { id: question.id } })}>
      <View style={styles.orb}>
        <Mascot feature="spaces" size={tall ? 58 : 72} />
      </View>
      <AppText variant="strip" style={styles.eyebrow}>
        {[strings.spaces.thisWeek, spaceName].filter(Boolean).join(' · ').toUpperCase()}
      </AppText>
      <AppText variant="heading" style={styles.question}>
        {question.question}
      </AppText>
      <View style={styles.footer}>
        <View style={styles.count}>
          <AppText variant="numeral">{String(answers).padStart(2, '0')}</AppText>
          <AppText variant="label">{strings.spaces.answersLabel(answers)}</AppText>
        </View>
        {tall ? null : (
          <View style={[styles.cta, { backgroundColor: theme.primary }]}>
            <AppText variant="label" color={theme.onPrimary}>
              {strings.spaces.answer}
            </AppText>
          </View>
        )}
      </View>
    </Glow>
  );
}

const styles = StyleSheet.create({
  tall: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    right: -10,
    top: -10,
  },
  eyebrow: {
    paddingRight: 56,
    opacity: 0.9,
  },
  question: {
    paddingRight: 30,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  cta: {
    height: 32,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    justifyContent: 'center',
  },
});
