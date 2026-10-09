import type { Session } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { CONSENT_VERSION } from '@/config';
import { usernameToEmail, type AgeBand } from '@/lib/account';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  username: string;
  avatar_id: number;
  age_band: string;
  role: 'user' | 'moderator';
  consent_version: string | null;
  banned_until: string | null;
};

/** Which part of the app the person should be in right now. */
export type Stage = 'loading' | 'onboarding' | 'recovery' | 'consent' | 'app';

type SignUpInput = {
  username: string;
  password: string;
  avatarId: number;
  ageBand: Exclude<AgeBand, 'under_16'>;
};

type AuthValue = {
  stage: Stage;
  profile: Profile | null;
  /** The freshly made recovery code, or null if making it failed. Shown once. */
  recoveryCode: string | null;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  acknowledgeRecoveryCode: () => void;
  acceptConsent: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth() {
  const value = use(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(!isSupabaseConfigured);
  // While an account is being created, stay on the sign-up screen until the
  // recovery code is ready, instead of jumping ahead the moment a session exists.
  const [signingUp, setSigningUp] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_id, age_band, role, consent_version, banned_until')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
  const profile = profileQuery.data ?? null;

  // A session whose account no longer exists (deleted elsewhere) is signed out.
  const accountGone = Boolean(userId) && profileQuery.isSuccess && profile === null;
  useEffect(() => {
    if (accountGone) supabase.auth.signOut();
  }, [accountGone]);

  let stage: Stage;
  if (!sessionLoaded) stage = 'loading';
  else if (!session || signingUp || accountGone) stage = 'onboarding';
  else if (profileQuery.isPending) stage = 'loading';
  else if (showRecovery) stage = 'recovery';
  else if (profile?.consent_version !== CONSENT_VERSION) stage = 'consent';
  else stage = 'app';

  const value: AuthValue = {
    stage,
    profile,
    recoveryCode,

    async signUp({ username, password, avatarId, ageBand }) {
      setSigningUp(true);
      try {
        const { error } = await supabase.auth.signUp({
          email: usernameToEmail(username),
          password,
          options: { data: { username, avatar_id: avatarId, age_band: ageBand } },
        });
        if (error) throw error;
        const code = await supabase.rpc('create_recovery_code');
        setRecoveryCode(code.error ? null : (code.data as string));
        setShowRecovery(true);
      } finally {
        setSigningUp(false);
      }
    },

    async signIn(username, password) {
      const { error } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
        password,
      });
      if (error) throw error;
    },

    async signOut() {
      await supabase.auth.signOut();
      setShowRecovery(false);
      setRecoveryCode(null);
      queryClient.clear();
    },

    acknowledgeRecoveryCode() {
      setShowRecovery(false);
      setRecoveryCode(null);
    },

    async acceptConsent() {
      const { error } = await supabase
        .from('profiles')
        .update({ consent_version: CONSENT_VERSION })
        .eq('id', userId!);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
