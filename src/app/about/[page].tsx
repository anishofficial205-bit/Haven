import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { spacing } from '@/theme';

const about = strings.about;

/** Mission, safety policy, community guidelines, terms, and the consent summary. */
export default function AboutScreen() {
  const theme = useTheme();
  const { page } = useLocalSearchParams<{ page: string }>();
  const content =
    page === 'consent'
      ? { title: strings.consent.title, sections: strings.consent.points }
      : (about.pages[page as keyof typeof about.pages] ?? about.pages.mission);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenHeader title={content.title} />
      <Screen>
        <AppText variant="label" color={theme.textSecondary}>
          {about.draftNote}
        </AppText>
        {content.sections.map((section) => (
          <View key={section.title} style={{ gap: spacing.xs }}>
            <AppText variant="bodyStrong">{section.title}</AppText>
            <AppText color={theme.textSecondary}>{section.body}</AppText>
          </View>
        ))}
      </Screen>
    </View>
  );
}
