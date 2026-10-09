import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useAuth } from '@/lib/auth';
import { useMyRequests } from '@/lib/help';
import { useBlockScreenshots } from '@/lib/privacy';
import { timeAgo } from '@/lib/time';
import { spacing } from '@/theme';

const copy = strings.help;

export default function MyRequestsScreen() {
  useBlockScreenshots();
  const theme = useTheme();
  const { profile } = useAuth();
  const requests = useMyRequests(profile?.id);

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={copy.myRequests} />
      <ScrollView contentContainerStyle={styles.content}>
        {requests.isPending ? <ActivityIndicator color={theme.primary} /> : null}
        {requests.isError ? <AppText color={theme.danger}>{strings.common.genericError}</AppText> : null}
        {requests.data?.length === 0 ? (
          <AppText color={theme.textSecondary} style={styles.empty}>
            {copy.noRequests}
          </AppText>
        ) : null}
        {requests.data?.map((request) => (
          <Pressable
            key={request.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/help/requests/[id]', params: { id: request.id } })}>
            <Card>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">{copy.to(request.professionals?.name ?? '')}</AppText>
                  <AppText variant="label" color={theme.textSecondary}>
                    {request.topic} · {timeAgo(request.created_at)}
                  </AppText>
                </View>
                <Chip label={copy.statuses[request.status]} />
                <ChevronRight size={20} color={theme.textSecondary} />
              </View>
              <AppText color={theme.textSecondary} numberOfLines={2}>
                {request.message}
              </AppText>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.xxl,
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
