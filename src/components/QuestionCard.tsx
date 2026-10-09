import { router } from 'expo-router';
import { Pin } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Tile } from '@/components/Tile';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import type { WeeklyQuestion } from '@/lib/spaces';
import { spacing } from '@/theme';

type Props = {
  question: WeeklyQuestion;
  /** Shown above the question, e.g. the space it belongs to */
  label?: string;
};

/** The pinned weekly question. Shown at the top of its space and on Home. */
export function QuestionCard({ question, label }: Props) {
  const theme = useTheme();
  return (
    <Tile
      tone="pink"
      arrow
      accessibilityLabel={`${question.question}. ${strings.spaces.answerThis}`}
      onPress={() => router.push({ pathname: '/question/[id]', params: { id: question.id } })}>
      <View style={styles.row}>
        <Pin size={16} color={theme.ink} />
        <AppText variant="label" color={theme.ink} style={styles.flex}>
          {label ?? strings.spaces.weekly}
        </AppText>
      </View>
      <AppText variant="heading" color={theme.ink} style={styles.question}>
        {question.question}
      </AppText>
      <AppText variant="script" color={theme.ink}>
        {strings.spaces.answerThis}
      </AppText>
    </Tile>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flex: {
    flex: 1,
  },
  question: {
    // Leaves room for the arrow button in the corner
    paddingRight: spacing.lg,
  },
});
