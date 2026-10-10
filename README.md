# Consent App (working title)

An anonymous, mobile-first space where young people practise consent. The full
product spec is in [docs/SPEC.md](docs/SPEC.md).

This guide assumes you have never set up an app before.

## 1. Run the app on your phone

You need two things: this folder on your Mac, and the **Expo Go** app on your
phone (free, from the Play Store or App Store). Your phone and Mac must be on
the same Wi-Fi.

Open the Terminal app, then:

```bash
cd "/Users/anish/Desktop/Haven VC/consent-app"
```

```bash
npx expo start
```

A QR code appears in the Terminal.

- **Android:** open Expo Go and tap "Scan QR code".
- **iPhone:** open the Camera app and point it at the QR code.

You should see a purple header saying "Hello", a shield and a profile icon,
and five tabs along the bottom: Home, Scenarios, Confess, Spaces, Help.

To stop the app, press `Ctrl + C` in the Terminal.

## 2. Set up the database (once)

The app stores accounts and posts in Supabase, a free hosted database.

1. Go to [supabase.com](https://supabase.com), sign up, and click **New project**.
   Pick any name, choose the region **Mumbai (ap-south-1)**, and save the
   database password somewhere safe.
2. Wait a minute or two until the project finishes setting up.
3. In the left sidebar open **SQL Editor**. For each of these six files, in
   this order: open the file on your Mac, copy everything in it, paste it into
   the editor, and press **Run**. Each one should say "Success".
   1. `supabase/migrations/0001_schema.sql`
   2. `supabase/migrations/0002_security.sql`
   3. `supabase/migrations/0003_feeds.sql`
   4. `supabase/migrations/0004_seed.sql`
   5. `supabase/migrations/0005_accounts.sql`
   6. `supabase/migrations/0006_moderation.sql`
4. Open **Authentication > Sign In / Providers > Email** and turn **Confirm
   email** OFF. (The app never asks for a real email, so there is nothing to
   confirm.)
5. Open **Project Settings > API Keys**. Copy the **Project URL** and the
   **Publishable key** (older projects call it the `anon` `public` key).
6. In the `consent-app` folder, make a copy of the file `.env.example` and name
   the copy `.env`. Paste your two values into it:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_...
   ```

7. Stop the app (`Ctrl + C`) and start it again with `npx expo start`.

On the Home tab, the grey "Setup check" card should now say
**"Connected. Found 6 spaces in the database."**

Never paste the **secret** / **service_role** key into `.env` or anywhere in
this folder. The `.env` file itself is never uploaded to git.

## 3. Everyday tasks

### Add a scenario

Add one JSON file to `content/scenarios/`. The easiest way is to copy an
existing one (for example `family-hug.json`) and change the words. No code
changes are needed; restart the app and it appears in the list.

- `domain` is one of `family`, `friends`, `relationships`, `digital`, `college_work`.
- Every choice needs a `label`, a `consequence`, an `expert_note`, and a `next`
  that matches the name of another node.
- An ending is a node with `"outcome": true`, a `title`, a `text` and a `takeaway`.
- In any text, a line that starts with a name and a colon, like `Mom: Why?`,
  becomes a speech bubble. A line starting with `You:` appears on the right.
- `"draft": true` shows a "Draft" label. Remove that line once the scenario has
  been reviewed.

### Make someone a moderator

They create an account in the app first. Then in the Supabase **SQL Editor**
run this, with their username:

```sql
update public.profiles set role = 'moderator' where username = 'their_username';
```

To undo it, run the same line with `'user'` instead of `'moderator'`.

They then sign out and back in. A **Mod queue** row appears on their Profile
page. From there a moderator can:

- approve or reject waiting replies, held posts and reported content
- ban whoever wrote something (for 1, 7 or 30 days, or permanently) without
  ever seeing who they are
- answer help requests on a professional's behalf (**Requests** tab)
- set each space's weekly question (**Tools** tab)

Two more moderator actions live in the three-dot menu on the content itself:
**Make confession of the day** on a published confession, and **Highlight this
answer** on an answer to a weekly question.

### Reset the database

This deletes every post, reply and setting. In the **SQL Editor**:

1. Paste and run `supabase/reset.sql`.
2. Run the six files from step 2.3 again, in order.

Accounts are separate: delete them under **Authentication > Users**.

### Build an Android app file for testers

This makes an `.apk` file testers can install without Expo Go. You need a free
account at [expo.dev](https://expo.dev) first.

```bash
npx eas-cli@latest build --profile preview --platform android
```

The first time, it asks you to sign in and to create a project and a signing
key: answer yes. The build takes 10 to 20 minutes on Expo's servers and ends
with a link to download the file. In this build, screenshots are blocked on
Android (that is what hides the app in the recent-apps list).

Before a build, EAS needs your two Supabase values as well. Run these once,
pasting your own values:

```bash
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co" --visibility plaintext
```

```bash
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_KEY --value "your-publishable-key" --visibility plaintext
```

### Run it on your phone (the way that works on this Wi-Fi)

Expo Go needs you signed in to the same free Expo account on the phone and on
the Mac. Do this once on the Mac (it opens your browser, so it works with a
Google sign-in):

```bash
npx expo login --browser
```

Then start the app in tunnel mode, which reaches the phone over the internet
instead of the local Wi-Fi, and scan the QR code with Expo Go:

```bash
npx expo start --tunnel
```

Leave that terminal running while you use the app. The address changes each
time you restart it, so scan the new code.

### Remove the sample posts

```sql
delete from public.posts where is_seed;
```

### Change colours, spacing or fonts

Everything visual is in [src/theme.ts](src/theme.ts).

### Change any wording

Every word the user sees is in [src/i18n/en.ts](src/i18n/en.ts).

## 4. Checks (for whoever is writing code)

```bash
npx tsc --noEmit
```

```bash
npx expo lint
```

```bash
npm run test:db
```

`test:db` loads the SQL files into a temporary in-memory database and checks
about 140 security rules: that one user can never find out who wrote a post,
that nobody can approve their own reply, that deleting an account removes
everything, and so on. It does not touch your Supabase project.

## 5. Where things are

```
src/app/              screens (one file per screen)
  (onboarding)/       intro slides, age check, sign up, sign in
  (tabs)/             Home, Scenarios, Confess, Spaces, Help
  scenario/ space/ question/ post/ help/   screens opened from the tabs
  profile/ settings/ about/ mod/            profile, settings, moderator tools
src/components/       reusable pieces (header, cards, panic button, ...)
src/lib/              Supabase connection and helpers
src/i18n/en.ts        all wording
src/theme.ts          colours, type, spacing
content/scenarios/     one JSON file per scenario
content/helplines.json helpline numbers
supabase/migrations/  the database, as SQL
docs/SPEC.md          the product spec
```
