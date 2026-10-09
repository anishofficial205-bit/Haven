import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { FormScreen } from '@/components/FormScreen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useAuth } from '@/lib/auth';
import { spacing } from '@/theme';

const copy = strings.consent;

/** Shown once after joining, and again only if CONSENT_VERSION changes. */
export default function ConsentScreen() {
  const theme = useTheme();
  const { acceptConsent } = useAuth();
  const [understood, setUnderstood] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await acceptConsent();
    } catch {
      setError(strings.common.genericError);
      setSubmitting(false);
    }
  };

  return (
    <FormScreen
      title={copy.title}
      subtitle={copy.intro}
      canGoBack={false}
      footer={
        <>
          <Checkbox label={copy.checkbox} checked={understood} onChange={setUnderstood} />
          {error ? (
            <AppText variant="label" color={theme.danger} accessibilityLiveRegion="polite">
              {error}
            </AppText>
          ) : null}
          <Button label={copy.submit} disabled={!understood} loading={submitting} onPress={onSubmit} />
        </>
      }>
      <View style={styles.points}>
        {copy.points.map((point) => (
          <Card key={point.title}>
            <AppText variant="bodyStrong">{point.title}</AppText>
            <AppText color={theme.textSecondary}>{point.body}</AppText>
          </Card>
        ))}
        <Button variant="text" label={copy.readPolicy} onPress={() => router.push('/policy')} />
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  points: {
    gap: spacing.md,
  },
});
