# Consent App (working title)

Anonymous, mobile-first space where Indian youth aged 16–22 practise consent.
Full spec: `docs/SPEC.md`. Read it before changing anything. Expo-specific rules: `AGENTS.md`.

## Stack

- Expo SDK 57 (React Native 0.86) + TypeScript, Expo Router. Routes live in `src/app/`.
- Styling: `StyleSheet` + tokens in `src/theme.ts`, read through `useTheme()`.
- Backend: Supabase (Postgres, Auth, RLS). SQL in `supabase/migrations/`.
- Data: TanStack Query + `src/lib/supabase.ts`.
- Icons: `lucide-react-native`. Font: Nunito.

## Commands

```bash
npx expo start          # run; scan the QR code with Expo Go
npx tsc --noEmit        # typecheck
npx expo lint           # lint
npm run test:db         # database security tests (in-memory Postgres, no Supabase needed)
npx expo install <pkg>  # add a package (never plain npm install)
```

Expo imports that changed in SDK 57: `Tabs` from `expo-router/js-tabs`, `Stack` from `expo-router/stack`.

## Principles (every decision passes all four)

1. Anonymous and safe first. When anonymity and convenience conflict, choose anonymity.
2. Peer-level, not instructional. A friend who knows things, never a teacher.
3. Culturally grounded. Indian family, college and workplace contexts.
4. Consequence-driven, not rule-driven. Show what happens, then explain why.

## Working rules

- Build in the phases in spec section 9, one at a time. Stop after each for phone testing. Commit per phase.
- Build nothing outside spec section 3 "in scope". If something seems missing, ask.
- The designer is not an engineer: plain steps, exact commands, say what they should see.
- All user-facing text goes in `src/i18n/en.ts`. No copy in components.
- Content (scenarios, spaces, helplines, professionals) is seed data in `content/` or the database.
- Never ask for real email, phone, name or photo. No analytics SDKs. No secrets in git.

## Database rules

- The app can never read another user's `author_id` or username next to their content.
  `posts`, `replies`, `reactions` are owner-read only; everyone else reads through the
  functions in `0003_feeds.sql`, which return `is_mine` and nothing else about authorship.
- Clients write only the columns granted in `0002_security.sql`. Status, role, highlighted,
  featured_on and author_id are set by triggers. New tables need RLS, policies and explicit grants.
- Blocking goes through `block_author(target_type, target_id)`; the app never handles a user id
  other than its own.
- After changing any SQL, run `npm run test:db` and add a test for the new rule.

## Routing

`src/lib/auth.tsx` computes a `stage` (onboarding, recovery, consent, app) and `src/app/_layout.tsx`
guards each screen group with `Stack.Protected`. Add new signed-in screens inside the `app` guard.
Signed-in screens outside the tabs use `ScreenHeader`, which carries the panic shield.
`src/lib/panic.tsx` wraps everything: after a quick exit only the calculator is rendered.
Call `useBlockScreenshots()` (src/lib/privacy.ts) on confession detail and help request screens.

## Posts

`src/lib/posts.ts` holds every query and mutation for posts, replies, reactions, reports, blocks
and saves. `PostCard`, `ReplyCard`, `ReactionBar` and `PostMenu` are shared by confessions and
(phase 7) spaces. Posts with trigger warnings render placeholder lines, never the real text, until
"Show anyway" is tapped.

## Progress

- [x] Phase 1 Foundation
- [x] Phase 2 Onboarding and account (password reset is a database function, not an Edge Function)
- [x] Phase 3 Safety layer (screenshot blocking and app-switcher hiding are untested: need a real phone)
- [x] Phase 4 Confessions (seeing another person's post, report, block and auto-hide need a second account to test)
- [ ] Phase 5 Moderation
- [ ] Phase 6 Scenarios
- [ ] Phase 7 Spaces
- [ ] Phase 8 Professional help
- [ ] Phase 9 Profile and settings
- [ ] Phase 10 Polish and test prep
