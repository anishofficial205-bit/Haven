import { ShieldCheck } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { usePanic } from '@/lib/panic';
import { minTapSize, radii } from '@/theme';

/**
 * The shield in the header of every signed-in screen.
 * Tap = quick exit to the calculator. Hold = helplines.
 */
export function PanicButton() {
  const { quickExit, openHelp } = usePanic();
  const theme = useTheme();
  return (
    <Pressable
      onPress={quickExit}
      onLongPress={openHelp}
      accessibilityRole="button"
      accessibilityLabel={strings.header.panicButton}
      accessibilityHint={strings.header.panicHint}
      hitSlop={4}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.panic, opacity: pressed ? 0.7 : 1 },
      ]}>
      <ShieldCheck size={24} color={theme.onPanic} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: minTapSize,
    height: minTapSize,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
