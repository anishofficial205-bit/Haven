import { router, useLocalSearchParams } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { PROFESSIONAL_TYPES, useProfessionals, type ProfessionalType } from '@/lib/help';
import { spacing } from '@/theme';

const copy = strings.help;

export default function ProfessionalListScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ type: ProfessionalType }>();
  const type = PROFESSIONAL_TYPES.includes(params.type) ? params.type : 'therapist';
  const list = useProfessionals(type);

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={copy.types[type].name} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText color={theme.textSecondary}>{copy.types[type].when}</AppText>
        {list.isPending ? <ActivityIndicator color={theme.primary} /> : null}
        {list.isError ? <AppText color={theme.danger}>{strings.common.genericError}</AppText> : null}
        {list.data?.length === 0 ? <AppText color={theme.textSecondary}>{copy.noProfessionals}</AppText> : null}
        {list.data?.map((person) => (
          <Pressable
            key={person.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/help/professional/[id]', params: { id: person.id } })}>
            <Card>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">{person.name}</AppText>
                  <AppText variant="label" color={theme.textSecondary}>
                    {person.languages.join(' · ')}
                  </AppText>
                </View>
                <ChevronRight size={20} color={theme.textSecondary} />
              </View>
              <AppText color={theme.textSecondary}>{person.bio}</AppText>
              <View style={styles.chips}>
                {person.placeholder ? <Chip tone="warning" label={copy.sampleProfile} /> : null}
                {person.focus_areas.map((area) => (
                  <Chip key={area} label={area} />
                ))}
              </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
