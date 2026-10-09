import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { minTapSize, radii, spacing } from '@/theme';

type Props = {
  label: string;
  /** Leave out onPress for a chip that is only a label */
  onPress?: () => void;
  selected?: boolean;
  /** 'warning' is for trigger warnings */
  tone?: 'default' | 'warning';
  /** How a selectable chip is announced: one of several, or on/off */
  role?: 'radio' | 'checkbox';
};

export function Chip({ label, onPress, selected = false, tone = 'default', role = 'checkbox' }: Props) {
  const theme = useTheme();
  const warning = tone === 'warning';

  if (!onPress) {
    return (
      <View style={[styles.label, { backgroundColor: warning ? theme.blocks.yellow : theme.surfaceAlt }]}>
        <AppText variant="caption" color={warning ? theme.ink : theme.textSecondary}>
          {label}
        </AppText>
      </View>
    );
  }

  // Selected: a filled pill. Warnings fill yellow; everything else fills with the primary colour.
  const fill = warning ? theme.blocks.yellow : theme.primary;
  const onFill = warning ? theme.ink : theme.onPrimary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityState={role === 'radio' ? { selected } : { checked: selected }}
      style={[
        styles.button,
        { backgroundColor: selected ? fill : 'transparent', borderColor: selected ? fill : theme.border },
      ]}>
      <AppText variant="label" color={selected ? onFill : theme.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  button: {
    minHeight: minTapSize,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
