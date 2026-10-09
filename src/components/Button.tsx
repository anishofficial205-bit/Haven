import { ActivityIndicator, StyleSheet, type PressableProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { minTapSize, radii, spacing } from '@/theme';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  /** primary = filled pill, secondary = outlined pill, text = no frame */
  variant?: 'primary' | 'secondary' | 'text';
  loading?: boolean;
};

export function Button({ label, variant = 'primary', loading, disabled, ...rest }: Props) {
  const theme = useTheme();
  const inactive = disabled || loading;
  const textColor = variant === 'primary' ? theme.onPrimary : theme.text;
  return (
    <PressableScale
      {...rest}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(inactive), busy: Boolean(loading) }}
      style={[
        styles.button,
        variant === 'primary' && { backgroundColor: theme.primary },
        variant === 'secondary' && { borderWidth: 1.5, borderColor: theme.text },
        { opacity: inactive ? 0.45 : 1 },
      ]}>
      {loading ? <ActivityIndicator color={textColor} /> : null}
      <AppText
        variant="bodyStrong"
        color={textColor}
        style={[styles.label, variant === 'text' && styles.underlined]}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: minTapSize + 6,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    textAlign: 'center',
  },
  underlined: {
    textDecorationLine: 'underline',
  },
});
