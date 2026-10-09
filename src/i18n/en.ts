/**
 * All user-facing text lives here. No copy is written inside screens or
 * components, so Hindi and Gujarati can be added later by translating this
 * one file.
 *
 * Voice: a well-informed older sibling. Warm, direct, never preachy.
 */
import { APP_NAME } from '@/config';

export const en = {
  appName: APP_NAME,

  tabs: {
    home: 'Home',
    scenarios: 'Scenarios',
    confess: 'Confess',
    spaces: 'Spaces',
    help: 'Help',
  },

  header: {
    hello: (username: string) => `Hello, ${username}`,
    helloGuest: 'Hello',
    openProfile: 'Open your profile',
    panicButton: 'Quick exit',
    panicHint: 'Leaves the app instantly. Hold for helplines.',
  },

  common: {
    back: 'Back',
    comingSoon: 'This part is being built',
  },

  home: {
    anonymousTitle: "You're anonymous here",
    anonymousBody: 'No real names, no photos, no contacts. No one can see your username on anything you share.',
  },

  scenarios: {
    title: 'Scenarios',
    placeholder: 'Short stories from real grey areas. You choose what happens next.',
  },

  confess: {
    title: 'Confess',
    placeholder: 'Say the thing you could never say out loud. Always posted as Anonymous.',
  },

  spaces: {
    title: 'Spaces',
    placeholder: 'Find the people who get it: family, college, relationships and more.',
  },

  help: {
    title: 'Help',
    placeholder: 'Helplines and people you can talk to, without anyone knowing who you are.',
  },

  profile: {
    title: 'Profile',
    placeholder: 'Your avatar, posts and settings will live here. Only you can see this page.',
  },

  /** Shown only while developing, never to testers. */
  dev: {
    title: 'Setup check',
    notConfigured: 'Supabase is not connected yet. Add your keys to the .env file (see README).',
    checking: 'Checking the database…',
    connected: (count: number) => `Connected. Found ${count} spaces in the database.`,
    emptyDatabase: 'Connected, but the database is empty. Run the SQL files in supabase/migrations (see README).',
    error: (message: string) => `Could not reach the database: ${message}`,
  },
} as const;

export const strings = en;
