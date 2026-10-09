import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Chip } from '@/components/Chip';
import { Badge, Frame, Stats, Strip } from '@/components/Collector';
import { Tile } from '@/components/Tile';
import { strings } from '@/i18n/en';
import { isOutcome, scenarios, statusOf, type Domain, type Progress, type Scenario } from '@/lib/scenarios';
import { spacing, type BlockTone } from '@/theme';

const copy = strings.scenarios;

/** Each domain has its own tile colour and its own character in the frame. */
const DOMAIN_LOOK: Record<Domain, { tone: BlockTone; avatar: number }> = {
  family: { tone: 'mint', avatar: 1 },
  friends: { tone: 'sky', avatar: 3 },
  relationships: { tone: 'rose', avatar: 6 },
  digital: { tone: 'sky', avatar: 4 },
  college_work: { tone: 'lime', avatar: 9 },
};

type Props = {
  scenario: Scenario;
  progress?: Progress;
  /** Override the tile colour (Home always uses mint) */
  tone?: BlockTone;
};

/**
 * A scenario as a collectible card: a typed strip with its number and stars,
 * the character and brush title in a frame, and a row of stats.
 */
export function ScenarioCard({ scenario, progress, tone }: Props) {
  const look = DOMAIN_LOOK[scenario.domain];
  const number = String(scenarios.indexOf(scenario) + 1).padStart(3, '0');
  const nodes = Object.values(scenario.nodes);
  const endings = nodes.filter(isOutcome).length;
  // Scenarios are short, and they all take about three minutes to play.
  const decisions = Math.max(1, Math.round((nodes.length - endings) / 1));
  const status = statusOf(progress);
  const stars = status === 'done' ? 3 : Math.min(progress?.path.length ?? 0, 2);

  return (
    <Tile
      tone={tone ?? look.tone}
      accessibilityLabel={`${scenario.title}. ${scenario.hook} ${copy.status[status]}.`}
      onPress={() => router.push({ pathname: '/scenario/[id]', params: { id: scenario.id } })}>
      <Strip left={`${copy.domains[scenario.domain]} · No.${number}`} stars={stars} />
      <View>
        <Frame>
          <Avatar id={look.avatar} size={62} bare />
          <AppText variant="display" style={styles.title}>
            {scenario.title}
          </AppText>
        </Frame>
        <Badge label={status === 'done' ? copy.again : status === 'in_progress' ? copy.resume : copy.play} style={styles.badge} />
      </View>
      <AppText variant="label">{scenario.hook}</AppText>
      <Stats
        items={[
          { value: '03', label: copy.statMinutes },
          { value: decisions, label: copy.statChoices },
          { value: endings, label: copy.statEndings },
        ]}
      />
      {scenario.draft || scenario.trigger_warnings.length > 0 ? (
        <View style={styles.chips}>
          {scenario.draft ? <Chip label={copy.draft} /> : null}
          {scenario.trigger_warnings.map((warning) => (
            <Chip key={warning} tone="warning" label={strings.triggerWarnings[warning]} />
          ))}
        </View>
      ) : null}
    </Tile>
  );
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
    paddingRight: spacing.xxl + spacing.md,
  },
  badge: {
    position: 'absolute',
    right: -4,
    top: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
