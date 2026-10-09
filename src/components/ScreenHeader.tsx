import { usePathname } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { PanicButton } from '@/components/PanicButton';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { goBack } from '@/lib/nav';
import { minTapSize, spacing } from '@/theme';

/**
 * Header for signed-in screens that sit on top of the tabs (profile, post
 * detail, ...): back arrow, title, and always the panic shield.
 */
export function ScreenHeader({ title }: { title: string }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.xs, backgroundColor: theme.background }]}>
      <Pressable
        onPress={() => goBack(pathname)}
        accessibilityRole="button"
        accessibilityLabel={strings.common.back}
        style={styles.back}>
        <ArrowLeft size={24} color={theme.text} />
      </Pressable>
      <AppText variant="heading" accessibilityRole="header" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
      <PanicButton />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.lg,
    paddingBottom: spacing.xs,
  },
  back: {
    width: minTapSize,
    height: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
  },
});
