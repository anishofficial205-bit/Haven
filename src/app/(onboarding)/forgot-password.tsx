import { router } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { PASSWORD_MIN, USERNAME_MAX } from '@/config';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const copy = strings.forgotPassword;

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!isSupabaseConfigured) return setError(strings.common.notConfigured);
    setSubmitting(true);
    const { data, error: failure } = await supabase.rpc('reset_password_with_recovery_code', {
      p_username: username,
      p_code: code,
      p_new_password: password,
    });
    setSubmitting(false);
    if (failure) setError(strings.common.genericError);
    else if (data === 'ok') setDone(true);
    else if (data === 'locked') setError(copy.locked);
    else if (data === 'weak') setError(copy.weak);
    else setError(copy.invalid);
  };

  if (done) {
    return (
      <FormScreen
        title={copy.successTitle}
        subtitle={copy.successBody}
        canGoBack={false}
        footer={<Button label={copy.backToSignIn} onPress={() => router.replace('/sign-in')} />}>
        {null}
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title={copy.title}
      subtitle={copy.body}
      footer={
        <>
          {error ? (
            <AppText variant="label" color={theme.danger} accessibilityLiveRegion="polite">
              {error}
            </AppText>
          ) : null}
          <Button
            label={copy.submit}
            disabled={!username || !code || password.length < PASSWORD_MIN}
            loading={submitting}
            onPress={onSubmit}
          />
        </>
      }>
      <TextField
        label={strings.signIn.usernameLabel}
        value={username}
        onChangeText={(text) => setUsername(text.trim())}
        maxLength={USERNAME_MAX}
        autoComplete="username"
      />
      <TextField
        label={copy.codeLabel}
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        autoComplete="off"
        maxLength={20}
      />
      <TextField
        label={copy.newPasswordLabel}
        value={password}
        onChangeText={setPassword}
        password
        autoComplete="new-password"
        help={strings.createAccount.passwordHelp}
      />
      <AppText variant="label" color={theme.textSecondary}>
        {copy.lostCode}
      </AppText>
    </FormScreen>
  );
}
