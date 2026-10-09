import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { Glow } from '@/components/Glow';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { DOMAIN_ICONS } from '@/lib/icons';
import { DOMAINS, isOutcome, scenarios, statusOf, useScenarioProgress } from '@/lib/scenarios';
import { FEATURE_TONE, radii, spacing, tileGap } from '@/theme';

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
              <Icon size={18} color={theme.text} />
              <AppText variant="heading" accessibilityRole="header">
                {copy.domains[domain]}
              </AppText>
            </View>

            {inDomain.map((scenario, index) => {
              const saved = progress.data?.[scenario.id];
              const status = statusOf(saved);
              const endings = Object.values(scenario.nodes).filter(isOutcome).length;
              return (
                <Glow
                  key={scenario.id}
                  tone={FEATURE_TONE.scenarios}
                  light={index % 2 === 0 ? 'left' : 'right'}
                  accessibilityLabel={`${scenario.title}. ${scenario.hook} ${copy.status[status]}.`}
                  onPress={() => router.push({ pathname: '/scenario/[id]', params: { id: scenario.id } })}>
                  <View style={styles.top}>
                    <AppText variant="strip" style={styles.flexDim}>
                      {copy.status[status].toUpperCase()}
                      {scenario.draft ? ` · ${copy.draft.toUpperCase()}` : ''}
                    </AppText>
                    {scenario.trigger_warnings.map((warning) => (
                      <Chip key={warning} tone="warning" label={strings.triggerWarnings[warning]} />
                    ))}
                  </View>
                  <AppText variant="title">{scenario.title}</AppText>
                  <AppText variant="label" style={styles.hook}>
                    {scenario.hook}
                  </AppText>
                  <View style={styles.foot}>
                    <View style={styles.baseline}>
                      <AppText variant="numeral" style={styles.small}>
                        03
                      </AppText>
                      <AppText variant="caption">{copy.statMinutes}</AppText>
                      <AppText variant="numeral" style={[styles.small, styles.gap]}>
                        {String(endings).padStart(2, '0')}
                      </AppText>
                      <AppText variant="caption">{copy.statEndings}</AppText>
                    </View>
                    <View
                      style={[
                        styles.cta,
                        status === 'done'
                          ? { borderWidth: 1.3, borderColor: 'rgba(255, 255, 255, 0.7)' }
                          : { backgroundColor: theme.primary },
                      ]}>
                      <AppText variant="label" color={status === 'done' ? theme.text : theme.onPrimary}>
                        {status === 'done' ? copy.again : status === 'in_progress' ? copy.resume : copy.play}
                      </AppText>
                    </View>
                  </View>
                </Glow>
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
    gap: tileGap,
  },
  groupTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flexDim: {
    flex: 1,
    opacity: 0.88,
  },
  hook: {
    opacity: 0.92,
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  baseline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  small: {
    fontSize: 24,
    lineHeight: 24,
  },
  gap: {
    marginLeft: spacing.md,
  },
  cta: {
    height: 34,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    justifyContent: 'center',
  },
});
