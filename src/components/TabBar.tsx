import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

export type TabItem = { name: string; label: string; icon: LucideIcon };

type Props = {
  tabs: TabItem[];
  /** Route name of the tab being shown */
  active: string;
  onSelect: (name: string) => void;
};

/**
 * The bottom bar: a dark capsule with an icon and a name for each section.
 * The one you're on is filled yellow.
 */
export function TabBar({ tabs, active, onSelect }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View accessibilityRole="tablist" style={[styles.bar, { borderColor: 'rgba(255, 255, 255, 0.16)' }]}>
        {tabs.map(({ name, label, icon: Icon }) => {
          const selected = name === active;
          const color = selected ? theme.onPrimary : '#A9A9B6';
          return (
            <Pressable
              key={name}
              onPress={() => onSelect(name)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              style={[styles.tab, selected && { backgroundColor: theme.primary }]}>
              <Icon size={19} strokeWidth={2} color={color} />
              <AppText variant="caption" color={color} numberOfLines={1} style={[styles.label, selected && styles.labelOn]}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    borderRadius: 28,
    borderWidth: 1,
    backgroundColor: 'rgba(22, 22, 26, 0.96)',
  },
  tab: {
    flex: 1,
    height: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    lineHeight: 13,
    fontFamily: 'Poppins_500Medium',
  },
  labelOn: {
    fontFamily: 'Poppins_600SemiBold',
  },
});
