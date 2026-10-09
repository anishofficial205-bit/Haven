import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

/** Scrolling page body with the standard 16px gutters. */
export function Screen({ contentContainerStyle, style, ...rest }: ScrollViewProps) {
  const theme = useTheme();
  return (
    <ScrollView
      {...rest}
      style={[{ backgroundColor: theme.background }, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    flexGrow: 1,
  },
});
