import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { AVATAR_COUNT, USERNAME_MAX, USERNAME_MIN } from '@/config';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import {
  checkUsername,
  isUsernameWellFormed,
  passwordStrength,
  suggestUsernames,
  type AgeBand,
  type UsernameStatus,
} from '@/lib/account';
import { useAuth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { minTapSize, radii, spacing } from '@/theme';

const copy = strings.createAccount;
const AVATAR_IDS = Array.from({ length: AVATAR_COUNT }, (_, i) => i + 1);

export default function CreateAccountScreen() {
  const theme = useTheme();
  const { signUp } = useAuth();
  const { ageBand } = useLocalSearchParams<{ ageBand: Exclude<AgeBand, 'under_16'> }>();

  const [username, setUsername] = useState('');
  const [checkedName, setCheckedName] = useState('');
  const [avatarId, setAvatarId] = useState(1);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Ask the database about the name a moment after typing stops.
  useEffect(() => {
    const timer = setTimeout(() => setCheckedName(username), 400);
    return () => clearTimeout(timer);
  }, [username]);

  const wellFormed = isUsernameWellFormed(username);
  const settled = checkedName === username;
  const check = useQuery({
    queryKey: ['username-check', checkedName],
    enabled: wellFormed && settled && isSupabaseConfigured,
    gcTime: 0,
    queryFn: async () => {
      const result = await checkUsername(checkedName);
      const needsIdeas = result === 'taken' || result === 'blocked';
      return {
        status: result,
        suggestions: needsIdeas ? await suggestUsernames(checkedName, result === 'blocked') : [],
      };
    },
  });

  let status: UsernameStatus | 'checking' | 'idle' = 'idle';
  if (username.length >= USERNAME_MIN && !wellFormed) status = 'invalid';
  else if (wellFormed && isSupabaseConfigured) {
    status = !settled || check.isFetching ? 'checking' : (check.data?.status ?? 'idle');
  }
  const suggestions = status === 'taken' || status === 'blocked' ? (check.data?.suggestions ?? []) : [];

  const strength = passwordStrength(password);
  const strengthColor = { tooShort: theme.danger, weak: theme.warning, okay: theme.primary, strong: theme.success }[strength];
  const strengthSteps = { tooShort: 0, weak: 1, okay: 2, strong: 3 }[strength];
  const canSubmit = status === 'ok' && strength !== 'tooShort' && Boolean(ageBand);

  const usernameError =
    status === 'invalid' ? copy.usernameInvalid
    : status === 'taken' ? copy.usernameTaken
    : status === 'blocked' ? copy.usernameBlocked
    : undefined;
  const usernameHelp =
    status === 'checking' ? copy.usernameChecking
    : status === 'ok' ? copy.usernameOk
    : copy.usernameHelp;

  const onSubmit = async () => {
    setFormError(null);
    if (!isSupabaseConfigured) return setFormError(strings.common.notConfigured);
    setSubmitting(true);
    try {
      await signUp({ username, password, avatarId, ageBand });
    } catch {
      // The name may have been taken in the last few seconds: check again so
      // the message says what actually went wrong.
      const latest = await check.refetch();
      if (latest.data?.status !== 'taken' && latest.data?.status !== 'blocked') {
        setFormError(strings.common.genericError);
      }
      setSubmitting(false);
    }
  };

  return (
    <FormScreen
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <>
          {formError ? (
            <AppText variant="label" color={theme.danger} accessibilityLiveRegion="polite">
              {formError}
            </AppText>
          ) : null}
          <Button label={copy.submit} disabled={!canSubmit} loading={submitting} onPress={onSubmit} />
        </>
      }>
      <View style={styles.block}>
        <TextField
          label={copy.usernameLabel}
          value={username}
          onChangeText={(text) => setUsername(text.replace(/\s/g, ''))}
          maxLength={USERNAME_MAX}
          autoComplete="off"
          help={usernameHelp}
          error={usernameError}
        />
        {suggestions.length > 0 ? (
          <View style={styles.suggestions}>
            {suggestions.map((name) => (
              <Pressable
                key={name}
                onPress={() => setUsername(name)}
                accessibilityRole="button"
                style={[styles.suggestion, { backgroundColor: theme.surfaceAlt }]}>
                <AppText variant="label" color={theme.primary}>
                  {name}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.block}>
        <AppText variant="label">{copy.avatarLabel}</AppText>
        <View accessibilityRole="radiogroup" style={styles.avatars}>
          {AVATAR_IDS.map((id) => {
            const selected = id === avatarId;
            return (
              <Pressable
                key={id}
                onPress={() => setAvatarId(id)}
                accessibilityRole="radio"
                accessibilityLabel={copy.avatarOption(id)}
                accessibilityState={{ selected }}
                style={[styles.avatar, { borderColor: selected ? theme.primary : 'transparent' }]}>
                <Avatar id={id} size={52} />
              </Pressable>
            );
          })}
        </View>
        <AppText variant="label" color={theme.textSecondary}>
          {copy.avatarHelp}
        </AppText>
      </View>

      <View style={styles.block}>
        <TextField
          label={copy.passwordLabel}
          value={password}
          onChangeText={setPassword}
          password
          autoComplete="new-password"
          help={copy.passwordHelp}
        />
        {password.length > 0 ? (
          <View
            style={styles.meterRow}
            accessibilityRole="text"
            accessibilityLabel={copy.strengthLabel(copy.strength[strength])}>
            <View style={styles.meter}>
              {[1, 2, 3].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.meterStep,
                    { backgroundColor: step <= strengthSteps ? strengthColor : theme.border },
                  ]}
                />
              ))}
            </View>
            <AppText variant="label" color={strengthColor}>
              {copy.strength[strength]}
            </AppText>
          </View>
        ) : null}
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestion: {
    minHeight: minTapSize,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    justifyContent: 'center',
  },
  avatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  avatar: {
    padding: 3,
    borderWidth: 3,
    borderRadius: radii.pill,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  meter: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  meterStep: {
    flex: 1,
    height: 6,
    borderRadius: radii.pill,
  },
});
