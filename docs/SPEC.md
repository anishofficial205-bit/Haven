# Consent App — v1 Build Spec for Claude Code

Oct 9, 2026 · @Anish

## 1. Why this app exists

Build a mobile-first, anonymous space where Indian youth aged 16–22 practise consent, not just learn the word. Research behind it (Consent Wall installation, focus groups, expert interview, two usability rounds) found the gap is **confidence, language and cultural safety**, not knowledge. Most participants had never discussed these situations with peers before.

Four product pillars:

1. **Scenarios with consequences**: short branching stories from real grey areas (a relative insisting on a hug, a screenshot shared without asking, a "no" at work met with silent disapproval). Each choice shows a realistic consequence, then a short expert note. This is the core of the app.
2. **Anonymous confessions with peer support**: text-only posts about a crossed boundary or confusing moment. Peer replies are checked for tone before anyone sees them.
3. **Topic spaces**: the same peer interaction, split by domain, because confidence varies by domain (high for digital, low for family and workplace).
4. **Professional help**: anonymous, in-app requests to therapists, intimacy coaches and legal advisors. Fear of being identified was the main reason people never sought help.

Design principles. Every decision should pass all four:

- **Anonymous and safe first.** Nothing public ever reveals who someone is. Anonymity is stated explicitly on every screen where people share.
- **Peer-level, not instructional.** Talk like a friend who knows things, never like a textbook or a teacher.
- **Culturally grounded.** Indian family, college, workplace and Bollywood-shaped contexts, not imported Western scripts.
- **Consequence-driven, not rule-driven.** Show what happens, then explain why. Do not lecture.

## 2. How to work on this (instructions for Claude Code)

Build in the phases in section 9, one at a time. Stop after each phase so the designer can test it on a phone.

**Working rules**

- Read this whole spec before writing code. Save a copy as `docs/SPEC.md` in the repo and keep a short `CLAUDE.md` with the stack, commands and principles.
- Do not add features outside section 3's "in scope" list. If something seems missing, ask instead of inventing it.
- The designer is a communication design student, not an engineer. Explain setup steps plainly, give exact commands, and say what they should see on screen.
- Commit after each phase with a clear message. Never commit secrets: keep keys in `.env` and add `.env.example`.
- All user-facing text lives in one strings file (`src/i18n/en.ts`) so Hindi and Gujarati can be added later. No hard-coded copy in components.
- Content (scenarios, spaces, helplines, professionals) is seed data in `/content` or the database, never hard-coded in screens.
- When anonymity and convenience conflict, choose anonymity.

**Tech stack**

| Layer | Choice | Why |
| --- | --- | --- |
| App | Expo (React Native) + TypeScript, Expo Router | Runs on the designer's phone through Expo Go; one codebase for Android and iOS |
| Styling | NativeWind (Tailwind for React Native) or StyleSheet with a `theme.ts` token file | Matches the purple prototype quickly |
| Backend | Supabase: Postgres, Auth, Row Level Security | Free tier, auth and database in one, works well with Expo |
| State and data | TanStack Query + Supabase JS client | Simple caching and refetching for feeds |
| Local secure storage | `expo-secure-store` | Session and quick-exit settings |
| Icons | `lucide-react-native` | Clean, consistent line icons |

**Suggested structure**

```
app/                 Expo Router screens
  (onboarding)/      intro, age, create account, sign in, consent
  (tabs)/            home, scenarios, confess, spaces, help
  profile/           profile and settings screens
src/components/      PostCard, ReplyCard, Composer, TriggerWarningGate, PanicButton, ...
src/lib/             supabase client, moderation filter, auth helpers
src/i18n/en.ts       all user-facing strings
src/theme.ts         colours, type scale, spacing, radii
content/scenarios/   one JSON file per scenario
supabase/migrations/ SQL schema, RLS policies, seed
```

## 3. v1 scope

v1 is a working prototype for testing with 10–20 students. It must be safe enough to put real people in front of: anonymity, moderation and crisis help are in from day one.

**In scope**

- Onboarding: intro slides, an age check (16–22 focus; under 16 blocked), username-only account, consent screen shown once
- Panic button and quick exit, always visible
- Scenarios: single-player branching stories with consequences and expert notes, plus progress
- Confessions: post, browse, filter, react, reply (Advice or Solidarity), report, block
- Topic spaces: join, post, reply, react, report, save, and a weekly pinned question
- Moderation: automatic filter, pre-approval of replies, a simple moderator screen
- Professional help: browse professionals, send an anonymous request (no payment), plus helplines
- Profile and settings: avatar, my posts, saved posts, blocked users, reports, theme, text size, change password, delete account, about pages

**Out of scope for v1 (do not build)**

| Feature | Why it waits |
| --- | --- |
| Payments | Breaks anonymity and adds legal work; v1 uses free requests |
| Video and voice calls | Heavy to build; v1 requests are text only |
| Multiplayer scenarios | Real-time sync is hard; single player proves the idea |
| Live sessions | No flow designed yet |
| Streaks and gamified badges | Pressure mechanics clash with "peer-level, not instructional" |
| Hindi and Gujarati | Strings are prepared; translation comes after English testing |
| Professionals' own app | v1 professionals are seed data; requests are handled by an admin |
| Push notifications and search | Not needed to test the core flows |

## 4. Navigation and screen map

The app has a 5-tab bottom bar plus a persistent header. The header shows "Hello, \<username>", the avatar (opens Profile) and the **panic button** on every logged-in screen.

**Entry**

1. App opens → if not signed in → Onboarding; if signed in → Home tab
2. Onboarding: Intro slides (3) → Age check → Create account *or* Sign in → Consent (first time only, or when the policy version changes) → Home

**Tabs**

| Tab | Screens inside |
| --- | --- |
| Home | Continue scenario card · Today's pinned question (from Spaces) · Confession of the day · "You're anonymous here" reminder · Quick links to Help |
| Scenarios | Scenario list by domain → Scenario player (story nodes → choice → consequence → expert note) → Outcome summary → "Talk about it" (opens Confess composer with the scenario tag) |
| Confess | Feed (filter and sort) → Confession detail (reactions, replies, reply composer) · Compose button → Composer → Preview → Posted confirmation |
| Spaces | Space list (join or leave) → Space feed (pinned weekly question, sort, tag filter, rules) → Post detail · Compose post |
| Help | Crisis helplines (top, highlighted) · Professional types → Professional list → Professional detail → Request form → Request sent · My requests |

**Profile (from the header avatar)**

- Profile: avatar and username (visible only to the user), My posts, Saved posts
- Settings → Privacy & Safety: blocked users, my reports, quick-exit setting
- Settings → Account: change password, recovery code, delete account
- Settings → Appearance: theme (system, light, dark), text size, high contrast
- Settings → About: mission, safety policy, community guidelines, terms, privacy policy
- Sign out

**Moderator (only for users with role `moderator`)**: a "Mod queue" item appears in Profile and opens the review screen.

## 5. Feature specs

Each feature lists what to build, then acceptance criteria. A phase is done only when every criterion passes on a real phone.

### 5.1 Onboarding and account

- **Intro slides (3):** (1) what this is: a safe, anonymous space to talk about consent and boundaries; (2) safety: panic button, moderation, helplines; (3) privacy: no real names, no photos, no contact sync. Include Skip and Next.
- **Age check:** "How old are you?" with bands: Under 16 / 16–17 / 18–22 / 23 or older. Store only the band. Under 16 → a kind screen saying the app isn't for them yet, with helplines, and no account.
- **Create account:**
  - Username: 3–20 characters, letters, numbers and underscore. Run it through the moderation filter, check uniqueness, and suggest 3 free alternatives if taken or blocked.
  - Avatar: pick from 12 preset illustrated avatars; no uploads.
  - Password with a strength meter (weak, okay, strong); minimum 8 characters.
  - Under the hood: Supabase email/password auth with a synthetic email `<username>@users.invalid`, and email confirmation turned off. Never ask for real email or phone in v1.
  - **Recovery code:** generate a 12-character code at signup and show it once with "Copy" and "I've saved it". Store only its hash. Use it instead of security questions.
- **Sign in:** username + password. "Forgot password" → enter username + recovery code → set a new password (Supabase Edge Function).
- **Consent screen:** a youth-friendly summary in 4–5 short points (what we store, what we never store, who can see what, how moderation works, how to delete everything). Links to the full policy. Mandatory checkbox "I understand how my data is protected", then the button "I'm ready to join". Store `consent_version` and timestamp. Show again only if the version changes.
- Copy tone: invitations, not legal warnings (round one testing found opt-in language intimidating).

Acceptance:

- A new user goes from install to Home in under 2 minutes without entering any real personal data
- A returning user signs in and lands on Home without seeing consent again
- A lost password can be reset with the recovery code

### 5.2 Panic button and quick exit

- A shield icon in the header on every logged-in screen.
- **Tap → Quick exit:** instantly replace the app with a neutral decoy screen (a plain working calculator), clear the navigation history, and make nothing of the app visible.
- Returning from the decoy: long-press the "=" key for 2 seconds → back to Home. Explain this in onboarding slide 2 and in Settings.
- **Long-press the shield → Help sheet** with helplines (section 7) as tap-to-call buttons.
- Android: block screenshots on sensitive screens (confession detail, help requests) with `expo-screen-capture`, and hide app content in the recent-apps switcher.

Acceptance:

- Quick exit happens in under 300 ms from any screen
- After quick exit, the system back button doesn't reveal app content

### 5.3 Scenarios (core feature)

- The list is grouped by domain: Family, Friends & Peers, Relationships, Digital, College & Work. Each card shows the title, a one-line hook, about 3 minutes' length, and a status (new, in progress, done).
- **Player:** a full-screen, illustrated, chat-like story. A node shows narration and dialogue, then 2–3 choices. Choosing shows a **consequence** (what happens next, how people react), then an **expert note** card ("Why this matters", 2–4 sentences, peer tone). Then the next node or the outcome.
- **Outcome screen:** what happened, the consent idea in plain words (e.g. "Silence isn't a yes"), and buttons: "Try a different path", "Talk about it anonymously" (Confess composer with the tag pre-filled), "Need to talk to someone?" (Help).
- No scores, right/wrong labels or points. Outcomes can be mixed or unresolved, especially family scenarios (round one testing found overly neat family endings unrealistic).
- Scenarios load from JSON in `content/scenarios/` using the schema below. Save progress per user.

```json
{
  "id": "family-hug",
  "title": "The hug at the wedding",
  "domain": "family",
  "hook": "Your aunt insists on a hug. Everyone's watching.",
  "trigger_warnings": [],
  "start": "n1",
  "nodes": {
    "n1": {
      "text": "Narration and dialogue...",
      "choices": [
        { "label": "Hug her anyway", "consequence": "...", "expert_note": "...", "next": "n2" },
        { "label": "Offer a namaste instead", "consequence": "...", "expert_note": "...", "next": "n3" }
      ]
    },
    "end_a": { "outcome": true, "title": "...", "takeaway": "Your body, your call — even with family." }
  }
}
```

Acceptance:

- Every choice shows a consequence and an expert note
- Progress survives closing the app
- Adding a new JSON file adds a scenario with no code change

### 5.4 Confessions

- **Composer:**
  - Text up to 1,000 characters, placeholder "What's on your mind?"
  - Tags (pick 1–3): Relationships, Family, Friendships, Digital, College & Work, Boundaries, Other
  - Trigger warnings (multi-select, optional): Violence, Harassment, Abuse, Breakup, Anxiety, Body
  - A fixed chip at the top: "Posting as Anonymous"
- Then a **preview** exactly as others will see it, then post. The confirmation says "Your confession is live, posted as Anonymous." If the moderation filter flags it, it says "Your post is being reviewed, usually within a day."
- **Feed:** cards show an anonymous avatar, the text, tags, time ago and reaction counts.
  - Filter by tag.
  - Sort: Most recent, Most supported, Has advice replies.
  - Cards with trigger warnings appear blurred with the warning chips and a "Show anyway" button.
- **Reactions:** supportive only, one per user per post, toggleable: 🤝 With you · 🫂 Hug · 💜 Sending love · 💪 You've got this · 👀 Same here. No downvotes or dislikes.
- **Replies:** choose Advice or Solidarity, then text up to 500 characters, posted anonymously. **Every reply goes to `pending`** and becomes visible only after moderator approval. The author of a reply sees "Waiting for review" on their own pending reply.
- **Overflow menu on any post or reply:** Report (reason: harassment, hateful, sexual content, self-harm risk, spam, other), Block author (hides all their content for me), Save.
- **Confession of the day:** a moderator can pin one approved confession per day; Home shows it.

Acceptance:

- No screen anywhere shows another user's username on a confession or reply
- A reply is never visible to other users before approval
- Blurred trigger-warning content is never shown until "Show anyway" is tapped

### 5.5 Topic spaces

- Seeded spaces are listed in section 7. Users join or leave; joined spaces are listed first.
- **Space screen:** name, a one-line description, a Rules button (bottom sheet), the **pinned weekly question** card at the top, then the feed.
- **Posts:** type (Question, Story, Rant), text up to 1,500 characters, optional tags, optional trigger warning, "Posting as Anonymous" chip. The same reactions, replies (pre-moderated), report, block and save as confessions. Reuse the same components.
- **Sort:** Most recent, Most supported, Most replies.
- **Weekly question:** a moderator sets one per space per week. Replies to it can be marked "Highlighted" by a moderator; highlighted replies show first.

Acceptance:

- Confessions and space posts share one `posts` table and one PostCard component
- A pinned question shows at the top of its space and on Home

### 5.6 Moderation

- **Automatic filter** (`src/lib/moderation.ts` + a database function, so it can't be bypassed): a word and pattern list for slurs, sexual content, harassment, phone numbers, emails, Instagram or Snapchat handles and links. Personal identifiers are blocked to protect anonymity.
  - Posts that fail go to `pending` with a reason.
  - Usernames that fail are rejected.
- **Self-harm keywords** don't block the post. They route it to `pending` with priority, and immediately show the author a gentle card with helplines.
- **Auto-hide:** a post or reply reaching 3 reports from different users is hidden until reviewed.
- **Mod queue screen:** tabs for Pending replies, Flagged posts and Reports, with Approve, Reject (choose a reason) and Ban user (temporary or permanent). Plus tools to set the confession of the day and weekly questions.
- The author is notified in-app (a status on their post) when content is rejected, with the community guideline it broke.

Acceptance:

- A moderator can clear the queue from a phone
- Non-moderators cannot read the queue or approve anything, enforced by RLS, not just the UI

### 5.7 Help: helplines and professionals

- At the top of the Help tab: **"Need help right now?"** with the helplines from section 7 as tap-to-call buttons. Always visible, no sign-in wall.
- **Professional types:** Therapist / Psychologist, Intimacy Coach, Legal Advisor. Each has a one-line explanation of when to choose it.
- **List → detail:** name, photo or illustration, qualifications, languages, focus areas, availability note.
- **Request form (anonymous):** what it's about (pick a topic), a short message (up to 800 characters), preferred language, preferred time window. Mode is text chat only in v1. A clear line: "The professional sees only your anonymous username and what you write here."
- **My requests:** status (Sent, Accepted, Scheduled, Closed) and replies in a simple message thread. In v1, an admin or moderator answers from the mod tools on the professional's behalf.
- **No payment** anywhere in v1.

Acceptance:

- A request can be sent and answered without either side seeing any real identity

### 5.8 Profile and settings

- All items listed in section 4.
- **Delete account:** confirmation, then delete the account and all the user's posts, replies, reactions and requests (hard delete via an Edge Function). Explain exactly what is removed.
- **Appearance:** light and dark themes, text size (3 steps), a high-contrast toggle. Respect the system font scale.

Acceptance:

- After deletion, none of the user's content appears anywhere and the username becomes available again

## 6. Data model and security

The one rule that matters most: **no query from the app can ever return another user's `author_id` or username alongside their content.** Enforce it in the database, not just the UI.

**Tables (Supabase Postgres)**

| Table | Key columns | Notes |
| --- | --- | --- |
| `profiles` | id (= auth user id), username (unique), avatar\_id, age\_band, role (`user` / `moderator`), consent\_version, consent\_at, recovery\_code\_hash, banned\_until | Readable only by its owner and moderators |
| `spaces` | id, slug, name, description, rules, sort\_order | Public read |
| `space_members` | user\_id, space\_id | Owner only |
| `posts` | id, author\_id, kind (`confession` / `space_post`), space\_id (null for confessions), post\_type (`question` / `story` / `rant`), body, tags\[\], trigger\_warnings\[\], status (`published` / `pending` / `rejected` / `hidden`), moderation\_reason, featured\_on (date, confession of the day), created\_at | Status set by a trigger that runs the filter |
| `replies` | id, post\_id, author\_id, kind (`advice` / `solidarity`), body, status (`pending` / `approved` / `rejected` / `hidden`), highlighted, created\_at | Always inserted as `pending` |
| `reactions` | user\_id, target\_type (`post` / `reply`), target\_id, emoji | Primary key (user\_id, target\_type, target\_id) |
| `reports` | id, reporter\_id, target\_type, target\_id, reason, note, status (`open` / `actioned` / `dismissed`), created\_at | A trigger auto-hides content at 3 distinct reporters |
| `blocks` | blocker\_id, blocked\_id | Applied in every feed query |
| `saves` | user\_id, post\_id | Owner only |
| `weekly_questions` | id, space\_id, question, week\_start, created\_by | Moderators write, all read |
| `scenario_progress` | user\_id, scenario\_id, current\_node, path (jsonb), completed\_at | Owner only |
| `professionals` | id, type, name, bio, qualifications, languages\[\], focus\_areas\[\], availability\_note, image\_url, active | Public read, seed data |
| `help_requests` | id, user\_id, professional\_id, type, topic, message, language, time\_window, status | Owner and moderators only |
| `help_messages` | id, request\_id, sender (`user` / `staff`), body, created\_at | Owner and moderators only |
| `moderation_terms` | id, pattern, category (`block` / `review` / `self_harm`) | Moderators only |

**Security rules**

- Turn on Row Level Security on every table. Create no table without policies.
- Feeds read from **views or RPC functions** (`feed_confessions`, `feed_space`, `post_detail`) that return: id, body, tags, trigger warnings, an anonymous avatar, reaction counts, reply counts, created\_at, and `is_mine` (boolean). They never return author\_id or username.
- Only `published` posts and `approved` replies are returned to others. Authors can also see their own pending items.
- Inserts: `author_id` is always `auth.uid()`, set by default or trigger, never sent by the client. Clients cannot set `status`, `role`, `highlighted` or `featured_on`.
- `is_moderator()` is a SQL helper that gates the mod queue and all moderation updates.
- Banned users (`banned_until > now()`) cannot insert posts, replies or reactions.
- Account deletion runs in an Edge Function with the service role and cascades through every table.
- **Privacy:** no analytics or ad SDKs, no contact or location permissions, no IP or device IDs stored in app tables. Keep the Supabase anon key public and the service role key in Edge Functions only.

## 7. Seed content

Claude Code writes first drafts of all seed content and marks each item `"draft": true`. The designer and the expert (intimacy and sex coach) review every scenario and expert note before testing with participants.

**Scenarios (write 6 for v1, drawn from Consent Wall themes)**

| ID | Domain | Situation | Consent idea it builds |
| --- | --- | --- | --- |
| `family-hug` | Family | A relative insists on a hug at a family function while everyone watches | Your body is your call, even with family; respectful alternatives exist |
| `screenshot-shared` | Digital | A friend screenshots your private chat and shares it in a group | Digital consent: sharing needs permission |
| `asked-again` | Relationships | You said no to a plan; your partner keeps asking "just once more" | Repeated asking is pressure, not persistence |
| `long-term-assumed` | Relationships | In a 2-year relationship, your partner assumes yes because "we're together" | Consent is ongoing, never assumed |
| `after-hours-work` | College & Work | You decline after-hours plans with a senior, then get silent disapproval | Power dynamics make refusal feel risky; your options |
| `tagged-photo` | Digital | You're tagged in an unflattering photo posted without asking | Asking before posting or tagging others |

Scenario writing rules: 3–5 decision points each, at least 2 different endings, names and settings that feel Indian, no graphic content, and at least one ending that isn't neat.

**Spaces**

| Space | One-line description |
| --- | --- |
| Relationships | Dating, partners, and the grey areas in between |
| Digital Boundaries | Chats, screenshots, tags, DMs and everything online |
| Family Pressure | When "log kya kahenge" meets your boundaries |
| College & Workplace | Seniors, professors, bosses and saying no to power |
| LGBTQ+ | Experiences and support, in a space that gets it |
| Just Talk | Anything else on your mind |

Seed 1 weekly question per space and 3–4 sample posts per space (marked as seed, deletable).

**Helplines (India) for the Help tab and panic sheet**

| Service | Number | For |
| --- | --- | --- |
| Emergency Response | 112 | Immediate danger |
| Women Helpline | 181 | Violence or harassment against women |
| Childline | 1098 | Anyone under 18 |
| Tele-MANAS | 14416 or 1-800-891-4416 | Free, 24×7 mental health support in many languages ([source](https://en.vikaspedia.in/viewcontent/health/mental-health/tele-manas)) |
| National Cyber Crime Helpline | 1930 | Online harassment, leaked images, fraud |

Verify every number again just before testing. Store helplines in a config file so they can be updated without a release.

**Professionals (placeholder seed)**: 2 per type (Therapist / Psychologist, Intimacy Coach, Legal Advisor) with obviously fictional names, marked `placeholder: true`. Replace them with real, consenting professionals before any public use.

## 8. Design and tone

The visual direction follows the tested prototype: soft purple gradients, rounded cards and illustrated scenarios. It should feel warm and safe, never clinical. Put every value in `src/theme.ts` so the designer can tune it in one place.

**Visual**

- **Colour:** a violet-to-lavender gradient for headers and primary surfaces, white or near-black cards, one accent for primary actions. Give the panic shield its own calm but distinct colour, not alarm red.
- **Shape:** 16–24 px card radius, pill buttons and chips, generous padding (16 px screen gutters).
- **Type:** one rounded sans (e.g. Plus Jakarta Sans or Nunito via `expo-font`); body at least 16 px, supporting the user's text-size setting.
- **Avatars:** 12 friendly illustrated avatars plus one generic "Anonymous" avatar used on all public content.
- **Accessibility:** minimum 44 px tap targets, WCAG AA contrast in both themes, labels on every icon button for screen readers.
- **Motion:** subtle only, respecting the system reduced-motion setting.

**Voice**

- Talk like a well-informed older sibling: warm, direct, never preachy. Hinglish phrases are fine where natural ("log kya kahenge").
- Say what happens instead of what's "wrong". Use "Here's what can happen…", not "This is incorrect."
- Make anonymity explicit at every share point: "Posting as Anonymous", "No one can see your username here."
- Avoid legal or clinical words in UI copy: "Your data, your call" over "Data processing consent".
- Rejections and errors are kind and specific, and say what to do next.

**Example strings**

| Where | Copy |
| --- | --- |
| Composer chip | Posting as Anonymous |
| Reply pending | Your reply is with our moderators. It'll show up once it's checked. |
| Consent button | I'm ready to join |
| Empty feed | Nothing here yet. Someone has to go first, and it's anonymous. |
| Quick exit help | Tap the shield to leave instantly. To come back, hold "=" on the calculator. |

## 9. Build phases and definition of done

Build in this order. Each phase ends with the app running on a phone through Expo Go, a commit, and a short summary of what to test.

1. **Foundation:** Expo + TypeScript + Expo Router project, theme tokens, strings file, Supabase project, full schema with RLS and seed (section 6), tab bar and header shell.
2. **Onboarding and account:** intro slides, age check, create account, recovery code, sign in, password reset, consent screen (5.1).
3. **Safety layer:** panic button, quick exit decoy, help sheet, Help tab helplines (5.2, the helplines part of 5.7).
4. **Confessions:** composer, preview, feed, filters, trigger-warning blur, reactions, replies (pending), report, block, save (5.4).
5. **Moderation:** filter, database trigger, self-harm routing, auto-hide, mod queue, confession of the day (5.6).
6. **Scenarios:** JSON loader, player, consequence and expert note cards, outcome screen, progress, 6 draft scenarios (5.3, section 7).
7. **Spaces:** list, join, space feed, weekly question, posts and replies reusing confession components (5.5).
8. **Professional help:** types, list, detail, anonymous request, My requests thread, admin reply in mod tools (5.7).
9. **Profile and settings:** My posts, Saved, Blocked, Reports, Appearance, change password, delete account, About pages (5.8).
10. **Polish and test prep:** empty, loading and error states, dark mode pass, accessibility pass, an Android build (EAS) for testers.

**Definition of done for v1**

- [ ] Every acceptance criterion in section 5 passes on Android and iOS
- [ ] An RLS check: signed in as user A, user B's identity can't be found from any post, reply, reaction or request
- [ ] Quick exit works from every screen
- [ ] No real personal data is requested anywhere
- [ ] All seed content reviewed by the designer and the expert, and the `draft` flags removed
- [ ] Helpline numbers re-verified
- [ ] A README explains how to run the app, add a scenario, make someone a moderator, and reset the database

**Open questions for the designer (Claude Code: ask, don't guess)**

- The app's name and logo (use a constant `APP_NAME` until then)
- Who moderates during testing, and how fast replies will be reviewed
- For under-18 participants: before any public launch, India's DPDP Act requires verifiable parental consent to process minors' data. Testing within the university study may need its own consent process; confirm with your guide.
