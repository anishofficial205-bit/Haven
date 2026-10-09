import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { radii, spacing } from '@/theme';

// "Mom: Why are you being so stiff?" -> a speech bubble from Mom.
const DIALOGUE = /^([A-Z][A-Za-z .']{0,24}): (.+)$/;

/**
 * Renders scenario text as a chat-like story. Each line of the JSON text is
 * either narration or, if it starts with "Name: ", a speech bubble.
 * Lines from "You" sit on the right, like your own messages.
 */
export function StoryText({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      {text.split('\n').map((line, index) => {
        const match = DIALOGUE.exec(line.trim());
        if (!match) {
          return <AppText key={index}>{line.trim()}</AppText>;
        }
        const [, speaker, words] = match;
        const mine = speaker === strings.scenarios.you;
        return (
          <View key={index} style={[styles.bubbleRow, mine && styles.mine]}>
            <View
              style={[
                styles.bubble,
                mine
                  ? { backgroundColor: theme.primary, borderBottomRightRadius: 6 }
                  : { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderTopLeftRadius: 6 },
              ]}>
              <AppText variant="caption" color={mine ? theme.onPrimary : theme.textSecondary}>
                {speaker}
              </AppText>
              <AppText color={mine ? theme.onPrimary : theme.text}>{words}</AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  bubbleRow: {
    flexDirection: 'row',
    paddingRight: spacing.xxl,
  },
  mine: {
    justifyContent: 'flex-end',
    paddingRight: 0,
    paddingLeft: spacing.xxl,
  },
  bubble: {
    borderRadius: radii.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 2,
    flexShrink: 1,
  },
});
