import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { DOMAIN_ICONS } from '@/lib/icons';
import { DOMAINS, scenarios, statusOf, useScenarioProgress } from '@/lib/scenarios';
import { radii, spacing } from '@/theme';

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
              <Icon size={20} color={theme.primary} />
              <AppText variant="heading" accessibilityRole="header">
                {copy.domains[domain]}
              </AppText>
            </View>

            {inDomain.map((scenario) => {
              const status = statusOf(progress.data?.[scenario.id]);
              return (
                <Pressable
                  key={scenario.id}
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: '/scenario/[id]', params: { id: scenario.id } })}>
                  <Card>
                    <View style={styles.row}>
                      <View style={[styles.icon, { backgroundColor: theme.surfaceAlt }]}>
                        <Icon size={24} color={theme.primary} />
                      </View>
                      <View style={styles.flex}>
                        <AppText variant="bodyStrong">{scenario.title}</AppText>
                        <AppText color={theme.textSecondary}>{scenario.hook}</AppText>
                      </View>
                      <ChevronRight size={20} color={theme.textSecondary} />
                    </View>
                    <View style={styles.chips}>
                      <Chip label={copy.status[status]} />
                      <Chip label={copy.length} />
                      {scenario.draft ? <Chip tone="warning" label={copy.draft} /> : null}
                      {scenario.trigger_warnings.map((warning) => (
                        <Chip key={warning} tone="warning" label={strings.triggerWarnings[warning]} />
                      ))}
                    </View>
                  </Card>
                </Pressable>
              );
            })}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radii.chip + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
