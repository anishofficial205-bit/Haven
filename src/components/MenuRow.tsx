import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { minTapSize, radii, spacing } from '@/theme';

type Props = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  /** Use the danger colour, e.g. for Delete account */
  danger?: boolean;
};

/** A tappable row that leads somewhere: used in Profile, Settings and About. */
export function MenuRow({ icon: Icon, label, onPress, danger }: Props) {
  const theme = useTheme();
  const color = danger ? theme.danger : theme.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? theme.surfaceAlt : theme.surface, borderColor: theme.border },
      ]}>
      <Icon size={22} color={danger ? theme.danger : theme.primary} />
      <AppText variant="bodyStrong" color={color} style={styles.flex}>
        {label}
      </AppText>
      <ChevronRight size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

export function MenuGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  row: {
    minHeight: minTapSize + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
});
