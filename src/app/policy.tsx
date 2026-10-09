import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { FormScreen } from '@/components/FormScreen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { spacing } from '@/theme';

const copy = strings.policy;

export default function PolicyScreen() {
  const theme = useTheme();
  return (
    <FormScreen title={copy.title} subtitle={copy.draftNote}>
      {copy.sections.map((section) => (
        <View key={section.title} style={{ gap: spacing.xs }}>
          <AppText variant="bodyStrong">{section.title}</AppText>
          <AppText color={theme.textSecondary}>{section.body}</AppText>
        </View>
      ))}
    </FormScreen>
  );
}
