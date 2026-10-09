import { router } from 'expo-router';
import { ArrowUpRight } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Strip } from '@/components/Collector';
import { Tile } from '@/components/Tile';
import { strings } from '@/i18n/en';
import { useQuestionReplies, type WeeklyQuestion } from '@/lib/spaces';
import { paperPalette, spacing } from '@/theme';

type Props = {
  question: WeeklyQuestion;
  /** The space it belongs to, shown on the right of the strip */
  spaceName?: string;
};

/** The pinned weekly question. Shown at the top of its space and on Home. */
export function QuestionCard({ question, spaceName }: Props) {
  const answers = useQuestionReplies(question.id).data?.filter((reply) => reply.status === 'approved').length ?? 0;
  return (
    <Tile
      tone="lime"
      accessibilityLabel={`${question.question}. ${strings.spaces.answerThis}`}
      onPress={() => router.push({ pathname: '/question/[id]', params: { id: question.id } })}>
      <Strip left={strings.spaces.weekly} right={spaceName} />
      <AppText variant="heading">{question.question}</AppText>
      <View style={styles.row}>
        <View style={styles.count}>
          <AppText variant="numeral">{String(answers).padStart(2, '0')}</AppText>
          <AppText variant="caption">{strings.spaces.answersLabel(answers)}</AppText>
        </View>
        <ArrowUpRight size={20} color={paperPalette.ink} />
      </View>
    </Tile>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  count: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs + 2,
  },
});
