import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { minTapSize, radii, spacing } from '@/theme';

export type TabItem = { name: string; label: string; icon: LucideIcon };

type Props = {
  tabs: TabItem[];
  /** Route name of the tab being shown */
  active: string;
  onSelect: (name: string) => void;
};

/**
 * The bottom bar. The tab you're on becomes a pill with its name spelled out;
 * the others are icons only.
 */
export function TabBar({ tabs, active, onSelect }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}>
      {tabs.map(({ name, label, icon: Icon }) => {
        const selected = name === active;
        return (
          <Pressable
            key={name}
            onPress={() => onSelect(name)}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            style={[styles.tab, selected && { backgroundColor: theme.blocks.mint, paddingHorizontal: spacing.lg }]}>
            <Icon size={22} color={selected ? theme.ink : theme.textSecondary} />
            {selected ? (
              <AppText variant="label" color={theme.ink} numberOfLines={1}>
                {label}
              </AppText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    minWidth: minTapSize + 4,
    height: minTapSize,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
  },
});
