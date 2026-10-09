import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { usePanic } from '@/lib/panic';
import { formatDate, useBlocks, useMyReports, useUnblock } from '@/lib/safety';
import { spacing } from '@/theme';

const copy = strings.settings;

export default function PrivacySettingsScreen() {
  const theme = useTheme();
  const { quickExit } = usePanic();
  const blocks = useBlocks();
  const unblock = useUnblock();
  const reports = useMyReports();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenHeader title={copy.privacy} />
      <Screen>
        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {copy.quickExit}
          </AppText>
          <Card>
            <AppText>{copy.quickExitBody}</AppText>
            <AppText color={theme.textSecondary}>{copy.quickExitMore}</AppText>
            <Button variant="secondary" label={copy.tryQuickExit} onPress={quickExit} />
          </Card>
        </View>

        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {copy.blocked}
          </AppText>
          <AppText color={theme.textSecondary}>{copy.blockedNote}</AppText>
          {blocks.data?.length === 0 ? <AppText color={theme.textSecondary}>{copy.blockedEmpty}</AppText> : null}
          {blocks.data?.map((block) => (
            <Card key={block.id}>
              <AppText>{copy.blockedItem(formatDate(block.created_at))}</AppText>
              <Button variant="secondary" label={copy.unblock} onPress={() => unblock.mutate(block.id)} />
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {copy.reports}
          </AppText>
          {reports.data?.length === 0 ? <AppText color={theme.textSecondary}>{copy.reportsEmpty}</AppText> : null}
          {reports.data?.map((report) => (
            <Card key={report.id}>
              <View style={styles.row}>
                <AppText variant="bodyStrong" style={styles.flex}>
                  {copy.reportTarget[report.target_type]}
                </AppText>
                <Chip label={copy.reportStatus[report.status]} />
              </View>
              <AppText color={theme.textSecondary}>
                {copy.reportItem(strings.report.reasons[report.reason], formatDate(report.created_at))}
              </AppText>
            </Card>
          ))}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
