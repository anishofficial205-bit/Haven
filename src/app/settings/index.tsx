import { router } from 'expo-router';
import {
  BookOpen,
  FileText,
  HeartHandshake,
  Lock,
  Palette,
  ScrollText,
  ShieldCheck,
  Target,
  UserRound,
} from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { MenuGroup, MenuRow } from '@/components/MenuRow';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';

const copy = strings.settings;
const about = strings.about;

export default function SettingsScreen() {
  const theme = useTheme();
  const page = (name: keyof typeof about.pages) => () =>
    router.push({ pathname: '/about/[page]', params: { page: name } });

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenHeader title={copy.title} />
      <Screen>
        <MenuGroup>
          <MenuRow icon={ShieldCheck} label={copy.privacy} onPress={() => router.push('/settings/privacy')} />
          <MenuRow icon={UserRound} label={copy.account} onPress={() => router.push('/settings/account')} />
          <MenuRow icon={Palette} label={copy.appearance} onPress={() => router.push('/settings/appearance')} />
        </MenuGroup>

        <AppText variant="heading" accessibilityRole="header">
          {copy.about}
        </AppText>
        <MenuGroup>
          <MenuRow icon={Target} label={about.pages.mission.title} onPress={page('mission')} />
          <MenuRow icon={HeartHandshake} label={about.pages.safety.title} onPress={page('safety')} />
          <MenuRow icon={BookOpen} label={about.pages.guidelines.title} onPress={page('guidelines')} />
          <MenuRow icon={ScrollText} label={about.pages.terms.title} onPress={page('terms')} />
          <MenuRow icon={Lock} label={about.privacyTitle} onPress={() => router.push('/policy')} />
          <MenuRow icon={FileText} label={strings.consent.title} onPress={() => router.push('/about/consent')} />
        </MenuGroup>
      </Screen>
    </View>
  );
}
