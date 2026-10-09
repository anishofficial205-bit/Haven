import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useAuth } from '@/lib/auth';
import { minTapSize, spacing } from '@/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuth();
  return (
    <View style={[styles.page, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={strings.common.back}
          style={styles.back}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <AppText variant="heading" accessibilityRole="header">
          {strings.profile.title}
        </AppText>
      </View>
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
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  back: {
    width: minTapSize,
    height: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
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
