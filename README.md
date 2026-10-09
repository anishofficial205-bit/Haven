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
3. In the left sidebar open **SQL Editor**. For each of these five files, in
   this order: open the file on your Mac, copy everything in it, paste it into
   the editor, and press **Run**. Each one should say "Success".
   1. `supabase/migrations/0001_schema.sql`
   2. `supabase/migrations/0002_security.sql`
   3. `supabase/migrations/0003_feeds.sql`
   4. `supabase/migrations/0004_seed.sql`
   5. `supabase/migrations/0005_accounts.sql`
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

Add one JSON file to `content/scenarios/`, following the format in
[docs/SPEC.md](docs/SPEC.md) section 5.3. No code changes needed. *(The
scenario player arrives in phase 6.)*

### Make someone a moderator

They create an account in the app first. Then in the Supabase **SQL Editor**
run this, with their username:

```sql
update public.profiles set role = 'moderator' where username = 'their_username';
```

To undo it, run the same line with `'user'` instead of `'moderator'`.

### Reset the database

This deletes every post, reply and setting. In the **SQL Editor**:

1. Paste and run `supabase/reset.sql`.
2. Run the five files from step 2.3 again, in order.

Accounts are separate: delete them under **Authentication > Users**.

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
about 100 security rules: that one user can never find out who wrote a post,
that nobody can approve their own reply, that deleting an account removes
everything, and so on. It does not touch your Supabase project.

## 5. Where things are

```
src/app/              screens (one file per screen)
  (tabs)/             Home, Scenarios, Confess, Spaces, Help
  profile/            profile and settings
src/components/       reusable pieces (header, cards, panic button, ...)
src/lib/              Supabase connection and helpers
src/i18n/en.ts        all wording
src/theme.ts          colours, type, spacing
content/              scenarios and other bundled content
supabase/migrations/  the database, as SQL
docs/SPEC.md          the product spec
```
