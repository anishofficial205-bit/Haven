import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Dots } from '@/components/Dots';
import { PanicButton } from '@/components/PanicButton';
import { PressableScale } from '@/components/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useAuth } from '@/lib/auth';
import { spacing } from '@/theme';

type Props = {
  /** Small line above the title */
  eyebrow: string;
  title: string;
};

/** The header on every tab: your avatar, where you are, and the panic shield. */
export function AppHeader({ eyebrow, title }: Props) {
  const theme = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  // Long titles (a long username on Home) shrink to stay on one line.
  const size = Math.max(15, Math.min(21, Math.floor(390 / Math.max(title.length, 1))));
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Dots />
      <PressableScale
        onPress={() => router.push('/profile')}
        accessibilityRole="button"
        accessibilityLabel={strings.header.openProfile}
        hitSlop={4}>
        <Avatar id={profile?.avatar_id ?? 1} size={40} />
      </PressableScale>
      <View style={styles.titles} accessibilityRole="header">
        <AppText variant="caption" color={theme.textSecondary} numberOfLines={1}>
          {eyebrow}
        </AppText>
        <AppText variant="title" numberOfLines={1} style={{ fontSize: size, lineHeight: size * 1.2 }}>
          {title}
        </AppText>
      </View>
      <PanicButton />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  titles: {
    flex: 1,
  },
});
