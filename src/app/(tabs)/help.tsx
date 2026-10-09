import { HeartHandshake } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { HelplineList } from '@/components/HelplineList';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { spacing } from '@/theme';

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

      <Card>
        <View style={styles.row}>
          <HeartHandshake size={24} color={theme.primary} />
          <AppText variant="bodyStrong" style={styles.flex}>
            {strings.help.professionalsTitle}
          </AppText>
        </View>
        <AppText color={theme.textSecondary}>{strings.help.professionalsBody}</AppText>
        <AppText variant="label" color={theme.textSecondary}>
          {strings.common.comingSoon}
        </AppText>
      </Card>
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
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
