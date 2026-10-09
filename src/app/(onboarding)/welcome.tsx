import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Dots } from '@/components/Dots';
import { Glow } from '@/components/Glow';
import { Asterisk, Orb } from '@/components/Objects';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { minTapSize, radii, spacing, type GlowTone } from '@/theme';

/** Each slide has its own glow colour and character. */
const SLIDES: { tone: GlowTone; avatar: number }[] = [
  { tone: 'lilac', avatar: 1 },
  { tone: 'mint', avatar: 4 },
  { tone: 'pink', avatar: 7 },
];

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const slides = strings.onboarding.slides;
  const slide = slides[index];
  const look = SLIDES[index];
  const isLast = index === slides.length - 1;

  return (
    <View style={[styles.page, { paddingTop: insets.top + spacing.sm }]}>
      <Dots />
      <View style={styles.skipRow}>
        {isLast ? null : (
          <Pressable onPress={() => router.push('/age')} accessibilityRole="button" style={styles.skip}>
            <AppText variant="bodyStrong">{strings.onboarding.skip}</AppText>
          </Pressable>
        )}
      </View>

      <Glow tone={look.tone} style={styles.hero}>
        <View style={styles.asterisk}>
          <Asterisk size={150} />
        </View>
        <View style={styles.orb}>
          <Orb size={74} />
        </View>
        <View style={styles.character}>
          <Avatar id={look.avatar} size={156} />
        </View>
      </Glow>

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
                { backgroundColor: i === index ? theme.primary : theme.surfaceAlt },
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

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={isLast ? strings.onboarding.getStarted : strings.onboarding.next}
          onPress={() => (isLast ? router.push('/age') : setIndex(index + 1))}
        />
        <Button variant="text" label={strings.onboarding.haveAccount} onPress={() => router.push('/sign-in')} />
        <Button variant="text" label={strings.helplines.link} onPress={() => router.push('/helplines')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
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
  hero: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  asterisk: {
    position: 'absolute',
    right: -26,
    top: -22,
  },
  orb: {
    position: 'absolute',
    left: -16,
    bottom: -14,
  },
  character: {
    transform: [{ rotate: '-4deg' }],
  },
  body: {
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
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
    paddingTop: spacing.lg,
    gap: 2,
  },
});
