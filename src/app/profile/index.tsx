import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useAuth } from '@/lib/auth';
import { spacing } from '@/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const { profile, signOut } = useAuth();
  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={strings.profile.title} />
      <Screen>
        <View style={styles.identity}>
          <Avatar id={profile?.avatar_id ?? 1} size={96} />
          <AppText variant="title">{profile?.username}</AppText>
          <AppText color={theme.textSecondary} style={styles.center}>
            {strings.profile.onlyYou}
          </AppText>
          <AppText variant="label" color={theme.textSecondary} style={styles.center}>
            {strings.profile.placeholder} {strings.common.comingSoon}.
          </AppText>
        </View>
        <Button variant="secondary" label={strings.profile.signOut} onPress={signOut} />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  identity: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  center: {
    textAlign: 'center',
  },
});
