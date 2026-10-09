import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pin } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import type { WeeklyQuestion } from '@/lib/spaces';
import { radii, spacing } from '@/theme';

type Props = {
  question: WeeklyQuestion;
  /** Shown above the question, e.g. the space it belongs to */
  label?: string;
};

/** The pinned weekly question. Shown at the top of its space and on Home. */
export function QuestionCard({ question, label }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={strings.spaces.answerThis}
      onPress={() => router.push({ pathname: '/question/[id]', params: { id: question.id } })}>
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.row}>
          <Pin size={16} color={theme.onGradientMuted} />
          <AppText variant="label" color={theme.onGradientMuted} style={styles.flex}>
            {label ?? strings.spaces.weekly}
          </AppText>
        </View>
        <AppText variant="heading" color={theme.onGradient}>
          {question.question}
        </AppText>
        <AppText variant="label" color={theme.onGradient}>
          {strings.spaces.answerThis} →
        </AppText>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flex: {
    flex: 1,
  },
});
