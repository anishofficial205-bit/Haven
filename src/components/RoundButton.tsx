import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { radii } from '@/theme';

type Props = {
  icon: LucideIcon;
  label: string;
  hint?: string;
  onPress?: () => void;
  onLongPress?: () => void;
};

/** A small round glass button: back, the shield, close. */
export function RoundButton({ icon: Icon, label, hint, onPress, onLongPress }: Props) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      hitSlop={4}
      style={[styles.button, { backgroundColor: theme.wash, borderColor: 'rgba(255, 255, 255, 0.24)' }]}>
      <Icon size={19} color={theme.text} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
