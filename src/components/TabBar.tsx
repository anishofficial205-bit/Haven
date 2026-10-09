import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { usePageTheme } from '@/hooks/useTheme';
import { radii, spacing } from '@/theme';

export type TabItem = { name: string; label: string; icon: LucideIcon };

type Props = {
  tabs: TabItem[];
  /** Route name of the tab being shown */
  active: string;
  onSelect: (name: string) => void;
};

/**
 * The bottom bar: a floating capsule. The tab you're on becomes a mint pill
 * with its name spelled out; the others are icons only.
 */
export function TabBar({ tabs, active, onSelect }: Props) {
  const theme = usePageTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View accessibilityRole="tablist" style={[styles.bar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {tabs.map(({ name, label, icon: Icon }) => {
          const selected = name === active;
          return (
            <Pressable
              key={name}
              onPress={() => onSelect(name)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              hitSlop={{ top: 6, bottom: 6 }}
              style={[styles.tab, selected && { backgroundColor: theme.blocks.mint, paddingHorizontal: spacing.md + 2 }]}>
              <Icon size={19} strokeWidth={2.1} color={selected ? theme.ink : theme.textSecondary} />
              {selected ? (
                <AppText variant="label" color={theme.ink} numberOfLines={1}>
                  {label}
                </AppText>
              ) : null}
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
    paddingTop: spacing.xs + 2,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  tab: {
    minWidth: 46,
    height: 38,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
