import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { minTapSize, radii, spacing, typography } from '@/theme';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  help?: string;
  /** Shown in place of the help line, in the error colour */
  error?: string;
  /** Hides the text and adds a show / hide eye */
  password?: boolean;
};

export function TextField({ label, help, error, password, ...rest }: Props) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const Icon = hidden ? Eye : EyeOff;

  return (
    <View style={styles.wrap}>
      <AppText variant="label">{label}</AppText>
      <View
        style={[
          styles.field,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : focused ? theme.primary : theme.border,
          },
        ]}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
          accessibilityLabel={label}
          secureTextEntry={password && hidden}
          placeholderTextColor={theme.textSecondary}
          onFocus={(event) => {
            setFocused(true);
            rest.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            rest.onBlur?.(event);
          }}
          style={[styles.input, typography.body, { color: theme.text }]}
        />
        {password ? (
          <Pressable
            onPress={() => setHidden(!hidden)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? strings.common.showPassword : strings.common.hidePassword}
            style={styles.eye}>
            <Icon size={22} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="label" color={theme.danger} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : help ? (
        <AppText variant="label" color={theme.textSecondary}>
          {help}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: radii.chip + 4,
    minHeight: minTapSize + 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    // The browser preview draws its own focus ring; the border already shows focus.
    outlineStyle: 'none',
  } as object,
  eye: {
    width: minTapSize,
    height: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
