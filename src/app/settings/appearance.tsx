import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useSettings, type TextSize } from '@/lib/settings';
import { spacing } from '@/theme';

const copy = strings.settings;
const SIZES: TextSize[] = ['medium', 'large', 'xlarge'];

/** Remembered on this phone only. Nothing here is sent anywhere. */
export default function AppearanceSettingsScreen() {
  const theme = useTheme();
  const settings = useSettings();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenHeader title={copy.appearance} />
      <Screen>
        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {copy.textSize}
          </AppText>
          <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={copy.textSize}>
            {SIZES.map((option) => (
              <Chip
                key={option}
                role="radio"
                label={copy.textSizes[option]}
                selected={settings.textSize === option}
                onPress={() => settings.update({ textSize: option })}
              />
            ))}
          </View>
          <Card>
            <AppText>{copy.sample}</AppText>
          </Card>
        </View>

        <View style={styles.section}>
          <Checkbox
            label={copy.highContrast}
            checked={settings.highContrast}
            onChange={(highContrast) => settings.update({ highContrast })}
          />
          <AppText color={theme.textSecondary}>{copy.highContrastHelp}</AppText>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
