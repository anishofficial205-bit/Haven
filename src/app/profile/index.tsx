import { router } from 'expo-router';
import { ArrowLeft, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { minTapSize, spacing } from '@/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
        <EmptyState
          icon={UserRound}
          title={strings.profile.title}
          body={strings.profile.placeholder}
          note={strings.common.comingSoon}
        />
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
});
