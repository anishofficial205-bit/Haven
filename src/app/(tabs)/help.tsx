import { router } from 'expo-router';
import { ChevronRight, Inbox } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { HelplineList } from '@/components/HelplineList';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { PROFESSIONAL_TYPES } from '@/lib/help';
import { TYPE_ICONS } from '@/lib/icons';
import { radii, spacing } from '@/theme';

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
            <Pressable
              key={type}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/help/[type]', params: { type } })}>
              <Card>
                <View style={styles.row}>
                  <View style={[styles.icon, { backgroundColor: theme.surfaceAlt }]}>
                    <Icon size={24} color={theme.primary} />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="bodyStrong">{copy.types[type].name}</AppText>
                    <AppText color={theme.textSecondary}>{copy.types[type].when}</AppText>
                  </View>
                  <ChevronRight size={20} color={theme.textSecondary} />
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.push('/help/requests')}>
        <Card>
          <View style={styles.row}>
            <Inbox size={24} color={theme.primary} />
            <AppText variant="bodyStrong" style={styles.flex}>
              {copy.myRequests}
            </AppText>
            <ChevronRight size={20} color={theme.textSecondary} />
          </View>
        </Card>
      </Pressable>
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
  icon: {
    width: 48,
    height: 48,
    borderRadius: radii.chip + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
