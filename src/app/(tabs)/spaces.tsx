import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useSpaces, useToggleMembership, type Space } from '@/lib/spaces';
import { spacing } from '@/theme';

const copy = strings.spaces;

export default function SpacesScreen() {
  const theme = useTheme();
  const spaces = useSpaces();
  const toggle = useToggleMembership();

  const joined = spaces.data?.filter((space) => space.joined) ?? [];
  const others = spaces.data?.filter((space) => !space.joined) ?? [];

  const section = (title: string, list: Space[]) =>
    list.length === 0 ? null : (
      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          {title}
        </AppText>
        {list.map((space) => (
          <Card key={space.id}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/space/[id]', params: { id: space.id } })}
              style={styles.row}>
              <View style={styles.flex}>
                <AppText variant="bodyStrong">{space.name}</AppText>
                <AppText color={theme.textSecondary}>{space.description}</AppText>
              </View>
              <ChevronRight size={20} color={theme.textSecondary} />
            </Pressable>
            <Button
              variant={space.joined ? 'text' : 'secondary'}
              label={space.joined ? copy.leave : copy.join}
              onPress={() => toggle.mutate({ spaceId: space.id, joined: space.joined })}
            />
          </Card>
        ))}
      </View>
    );

  return (
    <Screen>
      <AppText color={theme.textSecondary}>{copy.intro}</AppText>
      {spaces.isPending ? <ActivityIndicator color={theme.primary} /> : null}
      {spaces.isError ? <AppText color={theme.danger}>{strings.common.genericError}</AppText> : null}
      {section(copy.yours, joined)}
      {section(joined.length > 0 ? copy.more : copy.all, others)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: spacing.xs,
  },
});
