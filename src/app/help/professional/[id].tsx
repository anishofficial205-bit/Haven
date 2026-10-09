import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useProfessional } from '@/lib/help';
import { TYPE_ICONS } from '@/lib/icons';
import { radii, spacing } from '@/theme';

const copy = strings.help;

export default function ProfessionalScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useProfessional(id);
  const person = query.data;

  if (!person) {
    return (
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        <ScreenHeader title={copy.title} />
        {query.isPending ? null : (
          <AppText color={theme.textSecondary} style={styles.missing}>
            {copy.notFound}
          </AppText>
        )}
      </View>
    );
  }

  const Icon = TYPE_ICONS[person.type];
  const detail = (label: string, value: string) => (
    <View style={styles.detail}>
      <AppText variant="label" color={theme.textSecondary}>
        {label}
      </AppText>
      <AppText>{value}</AppText>
    </View>
  );

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={copy.types[person.type].name} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          {/* An illustration, never a photo, until real profiles are added. */}
          <View style={[styles.portrait, { backgroundColor: theme.surfaceAlt }]}>
            <Icon size={44} color={theme.primary} />
          </View>
          <AppText variant="title" style={styles.center}>
            {person.name}
          </AppText>
          {person.placeholder ? <Chip tone="warning" label={copy.sampleProfile} /> : null}
        </View>

        <AppText>{person.bio}</AppText>

        <Card>
          {detail(copy.qualifications, person.qualifications)}
          {detail(copy.languages, person.languages.join(', '))}
          {detail(copy.focusAreas, person.focus_areas.join(', '))}
          {detail(copy.availability, person.availability_note)}
        </Card>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <AppText variant="label" color={theme.textSecondary} style={styles.center}>
          {copy.free}
        </AppText>
        <Button
          label={copy.request}
          onPress={() => router.push({ pathname: '/help/request/[id]', params: { id: person.id } })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  missing: {
    textAlign: 'center',
    padding: spacing.xxl,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  top: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  portrait: {
    width: 96,
    height: 96,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  detail: {
    gap: 2,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});
