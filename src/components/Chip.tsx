import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing } from '@/theme';

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
      <View style={[styles.label, { backgroundColor: warning ? theme.primary : theme.surfaceAlt }]}>
        <AppText variant="caption" color={warning ? theme.onPrimary : theme.textSecondary}>
          {label}
        </AppText>
      </View>
    );
  }

  // Selected: a filled pill.
  const fill = theme.primary;
  const onFill = theme.onPrimary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityState={role === 'radio' ? { selected } : { checked: selected }}
      hitSlop={{ top: 5, bottom: 5 }}
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
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  button: {
    minHeight: 34,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.pill,
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
