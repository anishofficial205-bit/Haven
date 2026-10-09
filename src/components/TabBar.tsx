import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { radii, spacing } from '@/theme';

export type TabItem = { name: string; label: string; icon: LucideIcon };

type Props = {
  tabs: TabItem[];
  /** Route name of the tab being shown */
  active: string;
  onSelect: (name: string) => void;
};

/** The bottom bar: a dark capsule of icons. The tab you're on is a yellow disc. */
export function TabBar({ tabs, active, onSelect }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View accessibilityRole="tablist" style={[styles.bar, { borderColor: 'rgba(255, 255, 255, 0.16)' }]}>
        {tabs.map(({ name, label, icon: Icon }) => {
          const selected = name === active;
          return (
            <Pressable
              key={name}
              onPress={() => onSelect(name)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              style={[styles.tab, selected && { backgroundColor: theme.primary }]}>
              <Icon size={20} strokeWidth={2} color={selected ? theme.onPrimary : '#A9A9B6'} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  bar: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(22, 22, 26, 0.96)',
  },
  tab: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
