import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';

import { Dots } from '@/components/Dots';
import { spacing } from '@/theme';

/** Scrolling page body on the dotted background, with the standard 16px gutters. */
export function Screen({ contentContainerStyle, style, ...rest }: ScrollViewProps) {
  return (
    <View style={styles.fill}>
      <Dots />
      <ScrollView {...rest} style={style} contentContainerStyle={[styles.content, contentContainerStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    flexGrow: 1,
  },
});
