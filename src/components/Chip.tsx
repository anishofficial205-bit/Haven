import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, type Shades } from '@/theme';

type Props = {
  label: string;
  /** Leave out onPress for a chip that is only a label */
  onPress?: () => void;
  selected?: boolean;
  /** 'warning' is for trigger warnings and things that need attention */
  tone?: 'default' | 'warning';
  /** How a selectable chip is announced: one of several, or on/off */
  role?: 'radio' | 'checkbox';
  /** Inside one area of the app: selected fills with that area's pale shade, not yellow */
  shades?: Shades;
};

/**
 * With onPress: a pill you can select, which turns yellow when chosen.
 * Without: a small quiet label (yellow if it is a warning).
 */
export function Chip({ label, onPress, selected = false, tone = 'default', role = 'checkbox', shades }: Props) {
  const theme = useTheme();
  const warning = tone === 'warning';
  const fill = shades?.[1] ?? theme.primary;

  if (!onPress) {
    return (
      <View style={[styles.label, { backgroundColor: warning ? theme.primary : theme.surfaceAlt }]}>
        <AppText variant="caption" color={warning ? theme.onPrimary : '#D5D5DF'} style={styles.labelText}>
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
      hitSlop={{ top: 5, bottom: 5 }}
      style={[
        styles.pill,
        {
          backgroundColor: selected ? fill : 'transparent',
          borderColor: selected ? fill : (shades?.[5] ?? 'rgba(255, 255, 255, 0.55)'),
        },
      ]}>
      <AppText variant="label" color={selected ? (shades?.[7] ?? theme.onPrimary) : (shades?.[1] ?? theme.text)}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    height: 24,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.pill,
    justifyContent: 'center',
  },
  labelText: {
    fontFamily: 'Poppins_500Medium',
  },
  pill: {
    height: 36,
    paddingHorizontal: spacing.lg - 1,
    borderRadius: radii.pill,
    borderWidth: 1.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
