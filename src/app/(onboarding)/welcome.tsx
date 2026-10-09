import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Dots } from '@/components/Dots';
import { Starburst } from '@/components/Starburst';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { minTapSize, radii, spacing, type BlockTone } from '@/theme';

/** Each slide has its own colour for the big star. */
const TONES: BlockTone[] = ['rose', 'lime', 'mint'];

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const slides = strings.onboarding.slides;
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <View style={[styles.page, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <Dots />
      <View style={styles.skipRow}>
        {isLast ? null : (
          <Pressable onPress={() => router.push('/age')} accessibilityRole="button" style={styles.skip}>
            <AppText variant="bodyStrong">{strings.onboarding.skip}</AppText>
          </Pressable>
        )}
      </View>

      {/* Decoration only: a cluster of stars, one filled with this slide's colour. */}
      <View style={styles.art}>
        <View style={styles.outlineOne}>
          <Starburst size={170} stroke={theme.text} points={12} inner={0.12} />
        </View>
        <View style={styles.outlineTwo}>
          <Starburst size={120} stroke={theme.text} points={9} inner={0.14} />
        </View>
        <Starburst size={230} fill={theme.blocks[TONES[index]]} points={8} inner={0.14} />
      </View>

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
        <AppText variant="display" accessibilityRole="header">
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
  skipRow: {
    minHeight: minTapSize,
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  skip: {
    minHeight: minTapSize,
    minWidth: minTapSize,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: {
    flex: 1,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  outlineOne: {
    position: 'absolute',
    top: 0,
    left: -30,
  },
  outlineTwo: {
    position: 'absolute',
    bottom: 0,
    right: -10,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
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
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
});
