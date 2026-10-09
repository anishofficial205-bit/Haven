import { router } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { USERNAME_MAX } from '@/config';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { isUsernameWellFormed } from '@/lib/account';
import { useAuth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';

const copy = strings.signIn;

export default function SignInScreen() {
  const theme = useTheme();
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!isSupabaseConfigured) return setError(strings.common.notConfigured);
    // A name that could never exist can't match, so don't bother the server.
    if (!isUsernameWellFormed(username)) return setError(copy.wrong);
    setSubmitting(true);
    try {
      await signIn(username, password);
    } catch (caught) {
      const status = (caught as { status?: number }).status;
      setError(status === 400 ? copy.wrong : strings.common.genericError);
      setSubmitting(false);
    }
  };

  return (
    <FormScreen
      title={copy.title}
      footer={
        <>
          {error ? (
            <AppText variant="label" color={theme.danger} accessibilityLiveRegion="polite">
              {error}
            </AppText>
          ) : null}
          <Button
            label={copy.submit}
            disabled={!username || !password}
            loading={submitting}
            onPress={onSubmit}
          />
          <Button variant="text" label={copy.forgot} onPress={() => router.push('/forgot-password')} />
          <Button variant="text" label={copy.noAccount} onPress={() => router.replace('/age')} />
        </>
      }>
      <TextField
        label={copy.usernameLabel}
        value={username}
        onChangeText={(text) => setUsername(text.trim())}
        maxLength={USERNAME_MAX}
        autoComplete="username"
      />
      <TextField
        label={copy.passwordLabel}
        value={password}
        onChangeText={setPassword}
        password
        autoComplete="current-password"
        onSubmitEditing={onSubmit}
      />
    </FormScreen>
  );
}
