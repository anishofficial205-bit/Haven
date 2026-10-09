import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { REACTIONS, useReact, type Reaction, type TargetType } from '@/lib/posts';
import { minTapSize, radii, spacing } from '@/theme';

type Props = {
  targetType: TargetType;
  id: string;
  counts: Partial<Record<Reaction, number>>;
  mine: Reaction | null;
  /** Spell out each reaction ("Hug") beside its emoji */
  showLabels?: boolean;
  /** For the composer preview: looks real, does nothing */
  disabled?: boolean;
};

/** Five supportive reactions. One per person; tap again to take it back. */
export function ReactionBar({ targetType, id, counts, mine, showLabels, disabled }: Props) {
  const theme = useTheme();
  const react = useReact();
  return (
    <View style={styles.row}>
      {REACTIONS.map((key) => {
        const { emoji, label } = strings.reactions[key];
        const count = counts[key] ?? 0;
        const selected = mine === key;
        return (
          <Pressable
            key={key}
            disabled={disabled}
            onPress={() => react.mutate({ targetType, id, current: mine, emoji: key })}
            accessibilityRole="button"
            accessibilityLabel={strings.reactions.count(label, count)}
            accessibilityState={{ selected }}
            style={[
              styles.pill,
              {
                backgroundColor: selected ? theme.surfaceAlt : 'transparent',
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}>
            <Text style={styles.emoji}>{emoji}</Text>
            {showLabels ? <AppText variant="label">{label}</AppText> : null}
            {count > 0 ? (
              <AppText variant="label" color={selected ? theme.primary : theme.textSecondary}>
                {count}
              </AppText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    minHeight: minTapSize,
    minWidth: minTapSize,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 18,
  },
});
