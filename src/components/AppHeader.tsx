import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { PanicButton } from '@/components/PanicButton';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { minTapSize, radii, spacing } from '@/theme';

type Props = {
  /** Shown as "Hello, <username>". Only ever the signed-in user's own name. */
  username?: string;
};

/** The header on every signed-in screen: greeting, panic shield, avatar. */
export function AppHeader({ username }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
      <AppText
        variant="heading"
        color={theme.onGradient}
        numberOfLines={1}
        accessibilityRole="header"
        style={styles.greeting}>
        {username ? strings.header.hello(username) : strings.header.helloGuest}
      </AppText>

      <View style={styles.actions}>
        <PanicButton />
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel={strings.header.openProfile}
          hitSlop={4}
          style={({ pressed }) => [
            styles.avatar,
            { borderColor: theme.onGradientMuted, opacity: pressed ? 0.7 : 1 },
          ]}>
          <UserRound size={24} color={theme.onGradient} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomLeftRadius: radii.sheet,
    borderBottomRightRadius: radii.sheet,
  },
  greeting: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: minTapSize,
    height: minTapSize,
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
