import { ShieldCheck } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { usePanic } from '@/lib/panic';
import { radii } from '@/theme';

/**
 * The shield in the header of every signed-in screen.
 * Tap = quick exit to the calculator. Hold = helplines.
 */
export function PanicButton() {
  const { quickExit, openHelp } = usePanic();
  const theme = useTheme();
  return (
    <PressableScale
      onPress={quickExit}
      onLongPress={openHelp}
      accessibilityRole="button"
      accessibilityLabel={strings.header.panicButton}
      accessibilityHint={strings.header.panicHint}
      hitSlop={6}
      style={[styles.button, { backgroundColor: theme.ink, borderColor: theme.blocks.lime }]}>
      <ShieldCheck size={19} color={theme.blocks.lime} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
