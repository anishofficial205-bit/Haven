import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { EyeOff, MessagesSquare, ShieldCheck, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { minTapSize, radii, spacing } from '@/theme';

const ICONS: LucideIcon[] = [MessagesSquare, ShieldCheck, EyeOff];

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const slides = strings.onboarding.slides;
  const slide = slides[index];
  const Icon = ICONS[index];
  const isLast = index === slides.length - 1;

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.skipRow}>
          {isLast ? null : (
            <Pressable
              onPress={() => router.push('/age')}
              accessibilityRole="button"
              style={styles.skip}>
              <AppText variant="bodyStrong" color={theme.onGradient}>
                {strings.onboarding.skip}
              </AppText>
            </Pressable>
          )}
        </View>
        <View style={styles.heroIcon}>
          <Icon size={72} color={theme.onGradient} strokeWidth={1.5} />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View
          style={styles.dots}
          accessibilityRole="text"
          accessibilityLabel={strings.onboarding.slideProgress(index + 1, slides.length)}>
          {slides.map((item, i) => (
            <View
              key={item.title}
              style={[
                styles.dot,
                { backgroundColor: i === index ? theme.primary : theme.border },
                i === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <AppText variant="title" accessibilityRole="header">
          {slide.title}
        </AppText>
        <AppText color={theme.textSecondary}>{slide.body}</AppText>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          label={isLast ? strings.onboarding.getStarted : strings.onboarding.next}
          onPress={() => (isLast ? router.push('/age') : setIndex(index + 1))}
        />
        <Button
          variant="text"
          label={strings.onboarding.haveAccount}
          onPress={() => router.push('/sign-in')}
        />
        <Button
          variant="text"
          label={strings.helplines.link}
          onPress={() => router.push('/helplines')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  hero: {
    height: '38%',
    borderBottomLeftRadius: radii.sheet * 1.5,
    borderBottomRightRadius: radii.sheet * 1.5,
    paddingHorizontal: spacing.lg,
  },
  skipRow: {
    minHeight: minTapSize,
    alignItems: 'flex-end',
  },
  skip: {
    minHeight: minTapSize,
    minWidth: minTapSize,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
  },
  dotActive: {
    width: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
});
