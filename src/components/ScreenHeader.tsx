import { usePathname } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Dots } from '@/components/Dots';
import { PanicButton } from '@/components/PanicButton';
import { RoundButton } from '@/components/RoundButton';
import { strings } from '@/i18n/en';
import { goBack } from '@/lib/nav';
import { spacing } from '@/theme';

/**
 * Header for signed-in screens that sit on top of the tabs (profile, post
 * detail, ...): back, title, and always the panic shield.
 */
export function ScreenHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      {/* The header is the first thing on its page, so the texture drawn here sits behind everything else. */}
      <Dots window />
      <RoundButton icon={ArrowLeft} label={strings.common.back} onPress={() => goBack(pathname)} />
      <AppText variant="title" accessibilityRole="header" numberOfLines={1} style={styles.title}>
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
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    flex: 1,
  },
});
