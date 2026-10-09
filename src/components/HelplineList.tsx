import { Phone } from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { helplines } from '@/lib/helplines';
import { minTapSize, radii, spacing } from '@/theme';

/** Tap-to-call helplines. Used wherever someone might need help right now. */
export function HelplineList() {
  const theme = useTheme();
  return (
    <View style={styles.list}>
      {helplines.map((line) => (
        <Pressable
          key={line.id}
          onPress={() => Linking.openURL(`tel:${line.number}`)}
          accessibilityRole="button"
          accessibilityLabel={strings.helplines.call(line.name, line.number)}
          accessibilityHint={line.description}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
          ]}>
          <View style={[styles.icon, { backgroundColor: theme.panic }]}>
            <Phone size={20} color={theme.onPanic} />
          </View>
          <View style={styles.text}>
            <AppText variant="bodyStrong">{line.name}</AppText>
            <AppText variant="label" color={theme.textSecondary}>
              {line.description}
            </AppText>
          </View>
          <AppText variant="heading" color={theme.primary}>
            {line.number}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: minTapSize + 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
});
