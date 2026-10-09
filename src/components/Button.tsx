import { ActivityIndicator, StyleSheet, type PressableProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing } from '@/theme';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  /** primary = yellow pill, secondary = outlined pill, text = underlined words */
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
        variant === 'secondary' && { borderWidth: 1.3, borderColor: 'rgba(255, 255, 255, 0.7)' },
        variant === 'text' && styles.textOnly,
        { opacity: inactive ? 0.4 : 1 },
      ]}>
      {loading ? <ActivityIndicator color={textColor} /> : null}
      <AppText variant="bodyStrong" color={textColor} style={[styles.label, variant === 'text' && styles.underlined]}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  textOnly: {
    minHeight: 44,
  },
  label: {
    textAlign: 'center',
  },
  underlined: {
    textDecorationLine: 'underline',
  },
});
