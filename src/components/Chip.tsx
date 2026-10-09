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
  const accent = tone === 'warning' ? theme.warning : theme.primary;

  if (!onPress) {
    return (
      <View style={[styles.label, { backgroundColor: theme.surfaceAlt }]}>
        <AppText variant="caption" color={tone === 'warning' ? theme.warning : theme.textSecondary}>
          {label}
        </AppText>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityState={role === 'radio' ? { selected } : { checked: selected }}
      style={[
        styles.button,
        {
          backgroundColor: selected ? accent : theme.surface,
          borderColor: selected ? accent : theme.border,
        },
      ]}>
      <AppText variant="label" color={selected ? theme.onPrimary : theme.text}>
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
