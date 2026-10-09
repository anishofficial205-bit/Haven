import { ACCOUNT_EMAIL_DOMAIN, PASSWORD_MIN, USERNAME_MAX, USERNAME_MIN } from '@/config';
import { supabase } from '@/lib/supabase';

export type AgeBand = 'under_16' | '16_17' | '18_22' | '23_plus';
export type UsernameStatus = 'ok' | 'invalid' | 'blocked' | 'taken';
export type PasswordStrength = 'tooShort' | 'weak' | 'okay' | 'strong';

const USERNAME_PATTERN = new RegExp(`^[A-Za-z0-9_]{${USERNAME_MIN},${USERNAME_MAX}}$`);

export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@${ACCOUNT_EMAIL_DOMAIN}`;
}

export function isUsernameWellFormed(username: string) {
  return USERNAME_PATTERN.test(username);
}

/** Asks the database, which also runs the name through the moderation filter. */
export async function checkUsername(username: string): Promise<UsernameStatus> {
  if (!isUsernameWellFormed(username)) return 'invalid';
  const { data, error } = await supabase.rpc('username_available', { p_username: username });
  if (error) throw error;
  return data as UsernameStatus;
}

const SUGGESTION_WORDS = ['quiet', 'kind', 'brave', 'calm', 'true', 'soft', 'bold', 'free'];

/** Three free usernames to offer when the chosen one is taken or not allowed. */
export async function suggestUsernames(wanted: string, isBlocked: boolean): Promise<string[]> {
  const clean = wanted.replace(/[^A-Za-z0-9_]/g, '');
  const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
  const number = () => String(Math.floor(Math.random() * 900) + 100);
  const candidates = new Set<string>();
  for (let i = 0; i < 12; i++) {
    // A blocked name can't be the base of a suggestion.
    const base = isBlocked || clean.length < 2 ? `${pick(SUGGESTION_WORDS)}_${pick(['fox', 'owl', 'sky', 'moon', 'leaf'])}` : clean;
    const candidate = i % 2 === 0 ? `${base}_${number()}` : `${pick(SUGGESTION_WORDS)}_${base}`;
    candidates.add(candidate.slice(0, USERNAME_MAX));
  }
  const free: string[] = [];
  for (const candidate of candidates) {
    if (free.length === 3) break;
    if ((await checkUsername(candidate)) === 'ok') free.push(candidate);
  }
  return free;
}

export function passwordStrength(password: string): PasswordStrength {
  if (password.length < PASSWORD_MIN) return 'tooShort';
  const kinds = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((kind) => kind.test(password)).length;
  if (password.length >= 12 && kinds >= 3) return 'strong';
  if (password.length >= 10 && kinds >= 2) return 'okay';
  return 'weak';
}

/** ABCD2345EFGH -> ABCD-2345-EFGH, easier to read and write down. */
export function formatRecoveryCode(code: string) {
  return code.replace(/(.{4})(?=.)/g, '$1-');
}
