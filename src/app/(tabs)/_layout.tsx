import { Tabs } from 'expo-router/js-tabs';
import { House, LifeBuoy, MessageCircleHeart, Split, UsersRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { fonts } from '@/theme';

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 62 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: strings.tabs.home,
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scenarios"
        options={{
          title: strings.tabs.scenarios,
          tabBarIcon: ({ color, size }) => <Split color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="confess"
        options={{
          title: strings.tabs.confess,
          tabBarIcon: ({ color, size }) => <MessageCircleHeart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="spaces"
        options={{
          title: strings.tabs.spaces,
          tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: strings.tabs.help,
          tabBarIcon: ({ color, size }) => <LifeBuoy color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
