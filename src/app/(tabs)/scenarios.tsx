import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ScenarioCard } from '@/components/ScenarioCard';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { DOMAIN_ICONS } from '@/lib/icons';
import { DOMAINS, scenarios, useScenarioProgress } from '@/lib/scenarios';
import { spacing, tileGap } from '@/theme';

const copy = strings.scenarios;

export default function ScenariosScreen() {
  const theme = useTheme();
  const progress = useScenarioProgress();

  return (
    <Screen>
      <AppText color={theme.textSecondary}>{copy.intro}</AppText>

      {DOMAINS.map((domain) => {
        const inDomain = scenarios.filter((scenario) => scenario.domain === domain);
        if (inDomain.length === 0) return null;
        const Icon = DOMAIN_ICONS[domain];
        return (
          <View key={domain} style={styles.group}>
            <View style={styles.groupTitle}>
              <Icon size={20} color={theme.blocks.lime} />
              <AppText variant="heading" accessibilityRole="header">
                {copy.domains[domain]}
              </AppText>
            </View>
            <View style={styles.cards}>
              {inDomain.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} progress={progress.data?.[scenario.id]} />
              ))}
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.md,
  },
  groupTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cards: {
    gap: tileGap,
  },
});
