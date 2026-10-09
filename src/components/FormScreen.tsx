import { usePathname } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Dots } from '@/components/Dots';
import { RoundButton } from '@/components/RoundButton';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { goBack } from '@/lib/nav';
import { minTapSize, spacing } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  /** Show a back arrow. Off for screens that must not be skipped backwards. */
  canGoBack?: boolean;
  children: ReactNode;
  /** Buttons pinned under the content */
  footer?: ReactNode;
};

/** Page layout for the sign-up, sign-in and consent screens. */
export function FormScreen({ title, subtitle, canGoBack = true, children, footer }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.page, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <Dots />
      <View style={styles.bar}>
        {canGoBack ? (
          <RoundButton icon={ArrowLeft} label={strings.common.back} onPress={() => goBack(pathname)} />
        ) : null}
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heading}>
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          {subtitle ? <AppText color={theme.textSecondary}>{subtitle}</AppText> : null}
        </View>
        {children}
      </ScrollView>
      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>{footer}</View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  bar: {
    minHeight: minTapSize,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  heading: {
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});
