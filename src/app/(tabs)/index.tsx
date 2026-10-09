import { EyeOff } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { SetupCheck } from '@/components/SetupCheck';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { spacing } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <Card style={{ backgroundColor: theme.surfaceAlt }}>
        <View style={styles.row}>
          <EyeOff size={24} color={theme.primary} />
          <AppText variant="bodyStrong" style={styles.flex}>
            {strings.home.anonymousTitle}
          </AppText>
        </View>
        <AppText color={theme.textSecondary}>{strings.home.anonymousBody}</AppText>
      </Card>

      {__DEV__ ? <SetupCheck /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
