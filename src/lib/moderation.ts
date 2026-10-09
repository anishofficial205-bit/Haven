/**
 * A quick on-device check that mirrors the "personal details" part of the
 * database filter (supabase/migrations/0004_seed.sql). It only exists to warn
 * people before they post. The real decision is always made by the database,
 * which cannot be bypassed.
 */
const PERSONAL_INFO_PATTERNS = [
  /[0-9](?:[\s.-]?[0-9]){9,}/, // phone numbers
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, // emails
  /(?:^|\s)@[A-Za-z0-9._]{3,}/, // @handles
  /(?:https?:\/\/|www\.)\S+/i, // links
  /\b[a-z0-9-]+\.(?:com|in|net|org|me|co|io|app|ly|gg)\b/i,
  /\b(?:insta|instagram|ig|snap|snapchat|telegram|discord|whats\s?app)\s*(?:id|handle|username|user)\b/i,
  /\b(?:dm|message|text|add|follow)\s+me\s+(?:on|at)\b/i,
];

export function looksLikePersonalInfo(text: string) {
  return PERSONAL_INFO_PATTERNS.some((pattern) => pattern.test(text));
}
