import { router } from 'expo-router';
import { ChevronRight, Inbox } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Glow } from '@/components/Glow';
import { HelplineList } from '@/components/HelplineList';
import { MenuRow } from '@/components/MenuRow';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { PROFESSIONAL_TYPES } from '@/lib/help';
import { TYPE_ICONS } from '@/lib/icons';
import { FEATURE_TONE, radii, spacing } from '@/theme';

const copy = strings.help;

export default function HelpScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          {strings.helplines.title}
        </AppText>
        <AppText color={theme.textSecondary}>{strings.helplines.intro}</AppText>
        <HelplineList />
      </View>

      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          {copy.professionalsTitle}
        </AppText>
        <AppText color={theme.textSecondary}>{copy.professionalsBody}</AppText>
        {PROFESSIONAL_TYPES.map((type) => {
          const Icon = TYPE_ICONS[type];
          return (
            <Glow
              key={type}
              tone={FEATURE_TONE.help}
              light={PROFESSIONAL_TYPES.indexOf(type) % 2 === 0 ? 'left' : 'right'}
              style={styles.type}
              accessibilityLabel={`${copy.types[type].name}. ${copy.types[type].when}`}
              onPress={() => router.push({ pathname: '/help/[type]', params: { type } })}>
              <View style={[styles.icon, { backgroundColor: theme.wash }]}>
                <Icon size={22} color={theme.text} />
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyStrong">{copy.types[type].name}</AppText>
                <AppText variant="caption">{copy.types[type].when}</AppText>
              </View>
              <ChevronRight size={18} color={theme.text} />
            </Glow>
          );
        })}
      </View>

      <MenuRow icon={Inbox} label={copy.myRequests} onPress={() => router.push('/help/requests')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  type: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
