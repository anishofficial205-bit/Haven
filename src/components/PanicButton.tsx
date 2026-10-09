import { ShieldCheck } from 'lucide-react-native';

import { RoundButton } from '@/components/RoundButton';
import { strings } from '@/i18n/en';
import { usePanic } from '@/lib/panic';

/**
 * The shield in the header of every signed-in screen.
 * Tap = quick exit to the calculator. Hold = helplines.
 */
export function PanicButton() {
  const { quickExit, openHelp } = usePanic();
  return (
    <RoundButton
      icon={ShieldCheck}
      label={strings.header.panicButton}
      hint={strings.header.panicHint}
      onPress={quickExit}
      onLongPress={openHelp}
    />
  );
}
