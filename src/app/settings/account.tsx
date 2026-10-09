import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { PASSWORD_MIN } from '@/config';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { formatRecoveryCode } from '@/lib/account';
import { useAuth } from '@/lib/auth';
import { fonts, spacing } from '@/theme';

const copy = strings.settings;

export default function AccountSettingsScreen() {
  const theme = useTheme();
  const { profile, changePassword, newRecoveryCode, deleteAccount } = useAuth();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [passwordNote, setPasswordNote] = useState<{ text: string; isError: boolean } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [codeError, setCodeError] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const onSavePassword = async () => {
    setPasswordNote(null);
    setSavingPassword(true);
    try {
      const result = await changePassword(current, next);
      if (result === 'ok') {
        setCurrent('');
        setNext('');
        setPasswordNote({ text: copy.passwordChanged, isError: false });
      } else {
        setPasswordNote({ text: copy.wrongCurrent, isError: true });
      }
    } catch {
      setPasswordNote({ text: strings.common.genericError, isError: true });
    }
    setSavingPassword(false);
  };

  const onNewCode = async () => {
    setCodeError(false);
    setCopied(false);
    try {
      setCode(formatRecoveryCode(await newRecoveryCode()));
    } catch {
      setCodeError(true);
    }
  };

  const onDelete = async () => {
    setDeleteError(false);
    setDeleting(true);
    try {
      // On success the app drops straight back to the welcome screen.
      await deleteAccount();
    } catch {
      setDeleteError(true);
      setDeleting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenHeader title={copy.account} />
      <Screen keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {copy.changePassword}
          </AppText>
          <TextField
            label={copy.currentPassword}
            value={current}
            onChangeText={setCurrent}
            password
            autoComplete="current-password"
          />
          <TextField
            label={copy.newPassword}
            value={next}
            onChangeText={setNext}
            password
            autoComplete="new-password"
            help={strings.createAccount.passwordHelp}
          />
          {passwordNote ? (
            <AppText
              variant="label"
              color={passwordNote.isError ? theme.danger : theme.success}
              accessibilityLiveRegion="polite">
              {passwordNote.text}
            </AppText>
          ) : null}
          <Button
            label={copy.savePassword}
            disabled={!current || next.length < PASSWORD_MIN}
            loading={savingPassword}
            onPress={onSavePassword}
          />
        </View>

        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {copy.recoveryCode}
          </AppText>
          <AppText color={theme.textSecondary}>{copy.recoveryBody}</AppText>
          {code ? (
            <Card style={{ backgroundColor: theme.surfaceAlt }}>
              <AppText selectable style={styles.code}>
                {code}
              </AppText>
              <AppText variant="label" color={theme.textSecondary} style={styles.center}>
                {copy.newCodeShown}
              </AppText>
              <Button
                variant="secondary"
                label={copied ? strings.recoveryCode.copied : strings.recoveryCode.copy}
                onPress={async () => {
                  await Clipboard.setStringAsync(code);
                  setCopied(true);
                }}
              />
            </Card>
          ) : (
            <Button variant="secondary" label={copy.newCode} onPress={onNewCode} />
          )}
          {codeError ? (
            <AppText variant="label" color={theme.danger} accessibilityLiveRegion="polite">
              {strings.common.genericError}
            </AppText>
          ) : null}
        </View>

        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {copy.deleteAccount}
          </AppText>
          {confirmDelete ? (
            <Card>
              <AppText variant="bodyStrong">{copy.deleteTitle}</AppText>
              <AppText>{copy.deleteBody}</AppText>
              {copy.deleteList.map((item) => (
                <AppText key={item} color={theme.textSecondary}>
                  • {item}
                </AppText>
              ))}
              <AppText>{copy.deleteAfter}</AppText>
              <TextField
                label={copy.deleteConfirmLabel}
                value={typed}
                onChangeText={setTyped}
                autoComplete="off"
              />
              {deleteError ? (
                <AppText variant="label" color={theme.danger} accessibilityLiveRegion="polite">
                  {strings.common.genericError}
                </AppText>
              ) : null}
              <Button
                label={copy.deleteConfirm}
                disabled={typed.trim().toLowerCase() !== profile?.username.toLowerCase()}
                loading={deleting}
                onPress={onDelete}
              />
              <Button variant="text" label={strings.block.cancel} onPress={() => setConfirmDelete(false)} />
            </Card>
          ) : (
            <Button variant="secondary" label={copy.deleteAccount} onPress={() => setConfirmDelete(true)} />
          )}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
  code: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 2,
    textAlign: 'center',
  },
});
