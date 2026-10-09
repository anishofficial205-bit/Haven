import { Tabs } from 'expo-router/js-tabs';
import { House, LifeBuoy, MessageCircleHeart, Split, UsersRound } from 'lucide-react-native';

import { AppHeader } from '@/components/AppHeader';
import { TabBar, type TabItem } from '@/components/TabBar';
import { strings } from '@/i18n/en';

const TABS: TabItem[] = [
  { name: 'index', label: strings.tabs.home, icon: House },
  { name: 'scenarios', label: strings.tabs.scenarios, icon: Split },
  { name: 'confess', label: strings.tabs.confess, icon: MessageCircleHeart },
  { name: 'spaces', label: strings.tabs.spaces, icon: UsersRound },
  { name: 'help', label: strings.tabs.help, icon: LifeBuoy },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ header: () => <AppHeader /> }}
      tabBar={({ state, navigation }) => (
        <TabBar
          tabs={TABS}
          active={state.routes[state.index].name}
          onSelect={(name) => navigation.navigate(name)}
        />
      )}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}
