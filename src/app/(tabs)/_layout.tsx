import { Tabs } from 'expo-router/js-tabs';
import { House, LifeBuoy, MessageCircleHeart, Split, UsersRound } from 'lucide-react-native';

import { AppHeader } from '@/components/AppHeader';
import { TabBar, type TabItem } from '@/components/TabBar';
import { strings } from '@/i18n/en';
import { useAuth } from '@/lib/auth';

const TABS: TabItem[] = [
  { name: 'index', label: strings.tabs.home, icon: House },
  { name: 'scenarios', label: strings.tabs.scenarios, icon: Split },
  { name: 'confess', label: strings.tabs.confess, icon: MessageCircleHeart },
  { name: 'spaces', label: strings.tabs.spaces, icon: UsersRound },
  { name: 'help', label: strings.tabs.help, icon: LifeBuoy },
];

function todayLabel() {
  return strings.header.today(new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' }));
}

export default function TabsLayout() {
  const { profile } = useAuth();
  const titles: Record<string, { eyebrow: string; title: string }> = {
    index: { eyebrow: todayLabel(), title: strings.header.hello(profile?.username ?? '') },
    scenarios: { eyebrow: strings.header.eyebrows.scenarios, title: strings.tabs.scenarios },
    confess: { eyebrow: strings.header.eyebrows.confess, title: strings.tabs.confess },
    spaces: { eyebrow: strings.header.eyebrows.spaces, title: strings.tabs.spaces },
    help: { eyebrow: strings.header.eyebrows.help, title: strings.tabs.help },
  };
  return (
    <Tabs
      screenOptions={({ route }) => ({ header: () => <AppHeader {...titles[route.name]} /> })}
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
