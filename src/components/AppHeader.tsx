import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { PanicButton } from '@/components/PanicButton';
import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useAuth } from '@/lib/auth';
import { minTapSize, spacing } from '@/theme';

/**
 * The header on every tab: greeting, panic shield, avatar.
 * The username shown is only ever the signed-in person's own.
 */
export function AppHeader() {
  const theme = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.md, backgroundColor: theme.background }]}>
      <View style={styles.greeting} accessibilityRole="header">
        <AppText variant="script" color={theme.textSecondary}>
          {strings.header.greeting}
        </AppText>
        <AppText variant="title" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {profile?.username ?? ''}
        </AppText>
      </View>

      <View style={styles.actions}>
        <PanicButton />
        <PressableScale
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel={strings.header.openProfile}
          hitSlop={4}>
          <Avatar id={profile?.avatar_id ?? 1} size={minTapSize} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  greeting: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
