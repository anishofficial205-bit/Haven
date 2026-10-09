import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { formatRecoveryCode } from '@/lib/account';
import { useAuth } from '@/lib/auth';
import { fonts, radii, spacing } from '@/theme';

const copy = strings.recoveryCode;

/** Shown once, straight after sign-up. Only a hash of the code is stored. */
export default function RecoveryCodeScreen() {
  const theme = useTheme();
  const { recoveryCode, acknowledgeRecoveryCode } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!recoveryCode) {
    return (
      <FormScreen
        title={copy.title}
        subtitle={copy.failed}
        canGoBack={false}
        footer={<Button label={copy.continueAnyway} onPress={acknowledgeRecoveryCode} />}>
        {null}
      </FormScreen>
    );
  }

  const formatted = formatRecoveryCode(recoveryCode);
  return (
    <FormScreen
      title={copy.title}
      subtitle={copy.body}
      canGoBack={false}
      footer={<Button label={copy.confirm} onPress={acknowledgeRecoveryCode} />}>
      <View style={[styles.codeBox, { backgroundColor: theme.surfaceAlt, borderColor: theme.primary }]}>
        <AppText variant="label" color={theme.textSecondary}>
          {copy.codeLabel}
        </AppText>
        <AppText
          selectable
          style={styles.code}
          accessibilityLabel={formatted.split('').join(' ')}>
          {formatted}
        </AppText>
      </View>
      <Button
        variant="secondary"
        label={copied ? copy.copied : copy.copy}
        onPress={async () => {
          await Clipboard.setStringAsync(formatted);
          setCopied(true);
        }}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  codeBox: {
    borderRadius: radii.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  code: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 2,
    textAlign: 'center',
  },
});
