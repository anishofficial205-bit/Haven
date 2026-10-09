/** Working title. The real name and logo are still to be decided. */
export const APP_NAME = 'Consent App';

/** Bump this when the consent / privacy summary changes, so everyone sees it again. */
export const CONSENT_VERSION = '1';

/**
 * Accounts never use a real email. Supabase still needs something email-shaped,
 * so the app builds one from the username. Must match 0002_security.sql.
 */
export const ACCOUNT_EMAIL_DOMAIN = 'users.invalid';

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 8;
export const AVATAR_COUNT = 12;
