/**
 * All user-facing text lives here. No copy is written inside screens or
 * components, so Hindi and Gujarati can be added later by translating this
 * one file.
 *
 * Voice: a well-informed older sibling. Warm, direct, never preachy.
 * Invitations, not legal warnings.
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
    close: 'Close',
    comingSoon: 'This part is being built',
    genericError: "Something went wrong on our side. Check your internet and try again.",
    notConfigured: 'The app is not connected to its database yet. See the README to set it up.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },

  onboarding: {
    slides: [
      {
        title: 'A place for the stuff nobody talks about',
        body: "Consent, boundaries, and the grey areas in between. Practise what you'd say, share what happened, and hear from people your age.",
      },
      {
        title: 'Built to keep you safe',
        body: 'Tap the shield at the top to leave instantly: the app turns into a calculator. To come back, hold "=" for two seconds. Every reply is checked before anyone sees it, and helplines are always one tap away.',
      },
      {
        title: "Nobody knows it's you",
        body: 'No real names. No photos. No email, phone number or contacts. Just a username you make up, and even that stays hidden on everything you post.',
      },
    ],
    slideProgress: (current: number, total: number) => `Slide ${current} of ${total}`,
    skip: 'Skip',
    next: 'Next',
    getStarted: 'Get started',
    haveAccount: 'I already have an account',
  },

  age: {
    title: 'How old are you?',
    body: 'We only keep the age group, never your birthday.',
    bands: {
      under_16: 'Under 16',
      '16_17': '16–17',
      '18_22': '18–22',
      '23_plus': '23 or older',
    },
    continue: 'Continue',
  },

  notYet: {
    title: 'Not just yet',
    body: "This space is made for people who are 16 or older, so we can't set you up with an account right now. That's no judgement on you. If something is on your mind, these people will listen, for free.",
  },

  createAccount: {
    title: 'Make your account',
    subtitle: 'No email, no phone number. Just a made-up name.',
    usernameLabel: 'Username',
    usernameHelp: "3–20 letters, numbers or underscores. Don't use your real name.",
    usernameChecking: 'Checking…',
    usernameOk: "That one's free.",
    usernameInvalid: 'Use 3–20 letters, numbers or underscores only.',
    usernameTaken: 'Someone already has that one. Try one of these:',
    usernameBlocked: "That name isn't allowed here. Try one of these:",
    avatarLabel: 'Pick an avatar',
    avatarHelp: 'Only you will ever see it.',
    avatarOption: (number: number) => `Avatar ${number}`,
    passwordLabel: 'Password',
    passwordHelp: 'At least 8 characters. Longer is stronger.',
    strength: {
      tooShort: 'Too short',
      weak: 'Weak',
      okay: 'Okay',
      strong: 'Strong',
    },
    strengthLabel: (level: string) => `Password strength: ${level}`,
    submit: 'Create account',
  },

  recoveryCode: {
    title: 'Save your recovery code',
    body: "This is the only way back in if you forget your password, because we don't have your email or phone. Write it down, or save it somewhere only you can see. We'll show it just this once.",
    codeLabel: 'Your recovery code',
    copy: 'Copy',
    copied: 'Copied',
    confirm: "I've saved it",
    failed: "We couldn't make your recovery code just now. You can create one later from Settings.",
    continueAnyway: 'Continue',
  },

  signIn: {
    title: 'Welcome back',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    submit: 'Sign in',
    forgot: 'Forgot password?',
    wrong: "That username and password don't match. Check both and try again.",
    noAccount: 'New here? Make an account',
  },

  forgotPassword: {
    title: 'Reset your password',
    body: 'Enter your username and the recovery code you saved when you joined.',
    codeLabel: 'Recovery code',
    newPasswordLabel: 'New password',
    submit: 'Set new password',
    invalid: "That username and code don't match. Check both and try again.",
    locked: 'Too many tries. Wait 15 minutes, then try again.',
    weak: 'Your new password needs at least 8 characters.',
    lostCode: "Lost your recovery code too? We can't reset the account, because we never knew who you were. You can always make a new one.",
    successTitle: 'Password changed',
    successBody: 'Sign in with your new password.',
    backToSignIn: 'Back to sign in',
  },

  consent: {
    title: 'Your data, your call',
    intro: "Before you join, here's the short version.",
    points: [
      {
        title: 'What we keep',
        body: 'Your username, your age group, your avatar, and whatever you choose to post.',
      },
      {
        title: 'What we never keep',
        body: 'Your real name, email, phone number, photos, contacts or location.',
      },
      {
        title: 'Who sees what',
        body: 'Everything you post shows as Anonymous. No one else can see your username.',
      },
      {
        title: 'How moderation works',
        body: 'Replies are checked by a moderator before they appear. You can report or block anything.',
      },
      {
        title: 'Leaving',
        body: 'You can delete your account, and everything you posted, any time from Settings.',
      },
    ],
    readPolicy: 'Read the full policy',
    checkbox: 'I understand how my data is protected',
    submit: "I'm ready to join",
  },

  policy: {
    title: 'Privacy policy',
    draftNote: 'Draft wording. To be reviewed before testing with participants.',
    sections: [
      {
        title: 'What we store',
        body: 'A username you make up, a password (scrambled so nobody can read it, including us), the age group you picked, your avatar, and the posts, replies, reactions and help requests you create.',
      },
      {
        title: 'What we never ask for',
        body: 'Your real name, email address, phone number, photos, contacts, location or anything that identifies your device.',
      },
      {
        title: 'Who can see what',
        body: 'Other people see what you post, labelled Anonymous. They never see your username. Moderators see posts and replies so they can review them, without usernames attached. If you send a help request, the person answering sees your username and what you wrote in that request, nothing else.',
      },
      {
        title: 'Moderation',
        body: 'An automatic filter looks for abuse and for personal details like phone numbers, to protect your anonymity. Every reply is read by a moderator before it appears. Posts that break the community guidelines are removed, and you are told why.',
      },
      {
        title: 'Deleting everything',
        body: 'You can delete your account from Settings. That permanently removes your posts, replies, reactions and help requests, and frees up your username.',
      },
      {
        title: 'No tracking',
        body: 'There are no ads and no analytics in this app.',
      },
    ],
  },

  helplines: {
    title: 'Need help right now?',
    intro: 'Tap a number to call. These are free, and you don\'t have to give your name.',
    link: 'Need help right now?',
    call: (name: string, number: string) => `Call ${name} on ${number}`,
    items: {
      emergency: { name: 'Emergency', description: "If you're in immediate danger" },
      women: { name: 'Women Helpline', description: 'Violence or harassment against women' },
      childline: { name: 'Childline', description: 'For anyone under 18' },
      telemanas: { name: 'Tele-MANAS', description: 'Free mental health support, day and night. Also 1800-891-4416' },
      cybercrime: { name: 'Cyber Crime Helpline', description: 'Online harassment, leaked images, fraud' },
    },
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
    professionalsTitle: 'Talk to a professional',
    professionalsBody: 'Therapists, intimacy coaches and legal advisors you can message without anyone knowing who you are.',
  },

  profile: {
    title: 'Profile',
    onlyYou: 'Only you can see this page.',
    placeholder: 'Your posts and settings will live here.',
    signOut: 'Sign out',
  },

  /** The quick-exit decoy. Nothing here may mention the app. */
  calculator: {
    keys: {
      AC: 'Clear',
      '±': 'Plus minus',
      '%': 'Percent',
      '÷': 'Divide',
      '×': 'Multiply',
      '-': 'Minus',
      '+': 'Plus',
      '=': 'Equals',
      '.': 'Point',
    },
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
