import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import type { AgeBand } from '@/lib/account';
import { minTapSize, radii, spacing } from '@/theme';

const BANDS: AgeBand[] = ['under_16', '16_17', '18_22', '23_plus'];

export default function AgeScreen() {
  const theme = useTheme();
  const [band, setBand] = useState<AgeBand | null>(null);

  const onContinue = () => {
    if (band === 'under_16') router.push('/not-yet');
    else if (band) router.push({ pathname: '/create-account', params: { ageBand: band } });
  };

  return (
    <FormScreen
      title={strings.age.title}
      subtitle={strings.age.body}
      footer={<Button label={strings.age.continue} disabled={!band} onPress={onContinue} />}>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {BANDS.map((option) => {
          const selected = option === band;
          return (
            <Pressable
              key={option}
              onPress={() => setBand(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? theme.surfaceAlt : theme.surface,
                  borderColor: selected ? theme.primary : theme.border,
                },
              ]}>
              <AppText variant="bodyStrong">{strings.age.bands[option]}</AppText>
            </Pressable>
          );
        })}
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.md,
  },
  option: {
    minHeight: minTapSize + 12,
    borderRadius: radii.card,
    borderWidth: 2,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
});
