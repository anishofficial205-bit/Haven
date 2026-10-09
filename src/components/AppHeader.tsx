import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Dots } from '@/components/Dots';
import { PanicButton } from '@/components/PanicButton';
import { PressableScale } from '@/components/PressableScale';
import { Tile } from '@/components/Tile';
import { strings } from '@/i18n/en';
import { useAuth } from '@/lib/auth';
import { spacing } from '@/theme';

/**
 * The header on every tab: a lime tile with the greeting, the panic shield
 * and the avatar. The username shown is only ever the signed-in person's own.
 */
export function AppHeader() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  // Long usernames shrink to stay on one line.
  const nameSize = Math.max(14, Math.min(20, Math.floor(280 / Math.max(profile?.username.length ?? 1, 1))));

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
      <Dots />
      <Tile tone="lime" sharp="bottomLeft" style={styles.tile}>
        <View style={styles.greeting} accessibilityRole="header">
          <AppText variant="caption">{strings.header.greeting}</AppText>
          <AppText variant="title" numberOfLines={1} style={{ fontSize: nameSize, lineHeight: nameSize * 1.2 }}>
            {profile?.username ?? ''}
          </AppText>
        </View>
        <PanicButton />
        <PressableScale
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel={strings.header.openProfile}
          hitSlop={4}>
          <Avatar id={profile?.avatar_id ?? 1} size={38} />
        </PressableScale>
      </Tile>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 0,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  greeting: {
    flex: 1,
  },
});
