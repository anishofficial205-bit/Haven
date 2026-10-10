import { router } from 'expo-router';
import { ArrowRight, Check, Play } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { PressableScale } from '@/components/PressableScale';
import { ScenarioArt } from '@/components/ScenarioArt';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import {
  artOf,
  DOMAINS,
  scenarios,
  statusOf,
  useScenarioProgress,
  type Domain,
  type Scenario,
  type ScenarioStatus,
} from '@/lib/scenarios';
import { FEATURE_TONE, radii, shades, spacing, tileGap } from '@/theme';

const copy = strings.scenarios;
const L = shades[FEATURE_TONE.scenarios];
const USED_DOMAINS = DOMAINS.filter((domain) => scenarios.some((scenario) => scenario.domain === domain));

const open = (scenario: Scenario) => router.push({ pathname: '/scenario/[id]', params: { id: scenario.id } });

export default function ScenariosScreen() {
  const progress = useScenarioProgress();
  const [domain, setDomain] = useState<Domain | null>(null);
  const status = (scenario: Scenario) => statusOf(progress.data?.[scenario.id]);

  // The one to lead with: whatever is half played, else the first unplayed one.
  const featured =
    scenarios
      .filter((scenario) => status(scenario) === 'in_progress')
      .sort((a, b) => progress.data![b.id].updated_at.localeCompare(progress.data![a.id].updated_at))[0] ??
    scenarios.find((scenario) => status(scenario) === 'new') ??
    scenarios[0];
  const listed = domain
    ? scenarios.filter((scenario) => scenario.domain === domain)
    : scenarios.filter((scenario) => scenario !== featured);

  return (
    <Screen contentContainerStyle={styles.content}>
      {featured ? <Feature scenario={featured} status={status(featured)} /> : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="radiogroup"
        accessibilityLabel={copy.filterLabel}
        style={styles.chipScroll}
        contentContainerStyle={styles.chips}>
        <Chip role="radio" shades={L} label={copy.all} selected={domain === null} onPress={() => setDomain(null)} />
        {USED_DOMAINS.map((option) => (
          <Chip
            key={option}
            role="radio"
            shades={L}
            label={copy.domains[option]}
            selected={domain === option}
            onPress={() => setDomain(option)}
          />
        ))}
      </ScrollView>

      <View style={styles.list}>
        {listed.map((scenario) => (
          <Pill key={scenario.id} scenario={scenario} status={status(scenario)} />
        ))}
      </View>
    </Screen>
  );
}

/** The big picture at the top. */
function Feature({ scenario, status }: { scenario: Scenario; status: ScenarioStatus }) {
  const theme = useTheme();
  const lead = status === 'in_progress' ? copy.carryOn : status === 'done' ? copy.playedThis : copy.startHere;
  const action = status === 'in_progress' ? copy.resume : status === 'done' ? copy.again : copy.play;
  return (
    <PressableScale
      onPress={() => open(scenario)}
      accessibilityRole="button"
      accessibilityLabel={`${lead}: ${scenario.title}. ${scenario.hook} ${action}.`}
      style={styles.feature}>
      <ScenarioArt kind={artOf(scenario)} frame="wide" style={StyleSheet.absoluteFill} />
      <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="scenarioFeatureShade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.25" stopColor={L[8]} stopOpacity={0} />
              <Stop offset="0.8" stopColor={L[8]} stopOpacity={0.94} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#scenarioFeatureShade)" />
        </Svg>
      </View>

      <View style={styles.featureText}>
        <AppText variant="strip" color={L[1]}>
          {`${lead} · ${copy.domains[scenario.domain]}${scenario.draft ? ` · ${copy.draft}` : ''}`.toUpperCase()}
        </AppText>
        <AppText variant="display">{scenario.title}</AppText>
        <View style={styles.featureFoot}>
          <AppText variant="label" color={L[0]} numberOfLines={2} style={styles.grow}>
            {scenario.hook}
          </AppText>
          <View style={[styles.cta, { backgroundColor: theme.primary }]}>
            <Play size={13} color={theme.onPrimary} fill={theme.onPrimary} />
            <AppText variant="label" color={theme.onPrimary}>
              {action}
            </AppText>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

/** One scenario in the list: picture, title, a line about it, and where you are with it. */
function Pill({ scenario, status }: { scenario: Scenario; status: ScenarioStatus }) {
  const Icon = status === 'done' ? Check : status === 'in_progress' ? ArrowRight : Play;
  return (
    <PressableScale
      onPress={() => open(scenario)}
      accessibilityRole="button"
      accessibilityLabel={`${scenario.title}. ${scenario.hook} ${copy.status[status]}.`}
      style={styles.pill}>
      <ScenarioArt kind={artOf(scenario)} style={styles.pillArt} />
      <View style={styles.grow}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {scenario.title}
        </AppText>
        <AppText variant="caption" color={L[2]} numberOfLines={2} style={styles.pillLine}>
          {scenario.hook}
        </AppText>
      </View>
      <View
        style={[
          styles.dot,
          status === 'in_progress'
            ? { backgroundColor: L[1], borderColor: L[1] }
            : status === 'done'
              ? { backgroundColor: L[6], borderColor: L[6] }
              : null,
        ]}>
        <Icon
          size={15}
          strokeWidth={2.4}
          color={status === 'in_progress' ? L[7] : L[1]}
          fill={status === 'new' ? L[1] : 'none'}
        />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  grow: {
    flex: 1,
  },
  feature: {
    height: 236,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: L[5],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'flex-end',
  },
  featureText: {
    padding: spacing.lg,
    gap: 5,
  },
  featureFoot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  cta: {
    height: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipScroll: {
    marginHorizontal: -spacing.lg,
    flexGrow: 0,
  },
  chips: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  list: {
    gap: tileGap,
  },
  pill: {
    minHeight: 76,
    borderRadius: 38,
    padding: 7,
    paddingRight: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: L[8],
    borderWidth: 1,
    borderColor: L[6],
  },
  pillArt: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  pillLine: {
    opacity: 0.85,
    marginTop: 1,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.3,
    borderColor: L[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
