-- 0001_schema.sql
-- Tables only. Security (RLS, grants, triggers) is in 0002, feeds in 0003.
-- Run the files in order. See README "Set up the database".

-- ---------------------------------------------------------------------------
-- profiles: one row per account. Readable only by its owner and moderators.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  username            text not null,
  avatar_id           smallint not null default 1 check (avatar_id between 1 and 12),
  -- Only the band is stored, never an age or birthday. Under 16 never gets a row.
  age_band            text not null check (age_band in ('16_17', '18_22', '23_plus')),
  role                text not null default 'user' check (role in ('user', 'moderator')),
  consent_version     text,
  consent_at          timestamptz,
  recovery_code_hash  text,
  banned_until        timestamptz,
  created_at          timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_]{3,20}$')
);
create unique index profiles_username_lower_key on public.profiles (lower(username));

-- ---------------------------------------------------------------------------
-- spaces and membership
-- ---------------------------------------------------------------------------
create table public.spaces (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text not null,
  rules       text not null default '',
  sort_order  int  not null default 0
);

create table public.space_members (
  user_id   uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  space_id  uuid not null references public.spaces (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (user_id, space_id)
);

-- ---------------------------------------------------------------------------
-- posts: confessions and space posts share this table.
-- author_id is never returned to other users (see 0003 feeds).
-- ---------------------------------------------------------------------------
create table public.posts (
  id                uuid primary key default gen_random_uuid(),
  -- null only for seed posts, which belong to nobody
  author_id         uuid default auth.uid() references public.profiles (id) on delete cascade,
  kind              text not null check (kind in ('confession', 'space_post')),
  space_id          uuid references public.spaces (id) on delete cascade,
  post_type         text check (post_type in ('question', 'story', 'rant')),
  body              text not null,
  tags              text[] not null default '{}',
  trigger_warnings  text[] not null default '{}',
  status            text not null default 'pending'
                      check (status in ('published', 'pending', 'rejected', 'hidden')),
  moderation_reason text,
  priority          boolean not null default false, -- self-harm keywords: review first
  featured_on       date,                           -- confession of the day
  is_seed           boolean not null default false,
  created_at        timestamptz not null default now(),

  constraint posts_author_or_seed check (author_id is not null or is_seed),
  constraint posts_kind_shape check (
    (kind = 'confession' and space_id is null and post_type is null)
    or (kind = 'space_post' and space_id is not null and post_type is not null)
  ),
  constraint posts_body_length check (
    char_length(btrim(body)) >= 1
    and char_length(body) <= case when kind = 'confession' then 1000 else 1500 end
  ),
  constraint posts_tags_allowed check (
    tags <@ array['relationships', 'family', 'friendships', 'digital', 'college_work', 'boundaries', 'other']
  ),
  constraint posts_tags_count check (
    cardinality(tags) <= 3 and (kind <> 'confession' or cardinality(tags) >= 1)
  ),
  constraint posts_trigger_warnings_allowed check (
    trigger_warnings <@ array['violence', 'harassment', 'abuse', 'breakup', 'anxiety', 'body']
  ),
  constraint posts_featured_is_confession check (featured_on is null or kind = 'confession')
);
create unique index posts_featured_on_key on public.posts (featured_on) where featured_on is not null;
create index posts_feed_idx on public.posts (kind, status, created_at desc);
create index posts_space_idx on public.posts (space_id, status, created_at desc);
create index posts_author_idx on public.posts (author_id);

-- ---------------------------------------------------------------------------
-- weekly_questions: one pinned question per space per week
-- ---------------------------------------------------------------------------
create table public.weekly_questions (
  id         uuid primary key default gen_random_uuid(),
  space_id   uuid not null references public.spaces (id) on delete cascade,
  question   text not null check (char_length(btrim(question)) between 1 and 300),
  week_start date not null,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  unique (space_id, week_start)
);

-- ---------------------------------------------------------------------------
-- replies: always start as 'pending'. A reply belongs to a post OR to a
-- weekly question (never both).
-- ---------------------------------------------------------------------------
create table public.replies (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid references public.posts (id) on delete cascade,
  question_id       uuid references public.weekly_questions (id) on delete cascade,
  author_id         uuid default auth.uid() references public.profiles (id) on delete cascade,
  kind              text not null check (kind in ('advice', 'solidarity')),
  body              text not null check (char_length(btrim(body)) >= 1 and char_length(body) <= 500),
  status            text not null default 'pending'
                      check (status in ('pending', 'approved', 'rejected', 'hidden')),
  moderation_reason text,
  priority          boolean not null default false,
  highlighted       boolean not null default false,
  is_seed           boolean not null default false,
  created_at        timestamptz not null default now(),

  constraint replies_one_parent check (num_nonnulls(post_id, question_id) = 1),
  constraint replies_author_or_seed check (author_id is not null or is_seed)
);
create index replies_post_idx on public.replies (post_id, status, created_at);
create index replies_question_idx on public.replies (question_id, status, created_at);
create index replies_author_idx on public.replies (author_id);

-- ---------------------------------------------------------------------------
-- reactions: supportive only, one per user per target
-- ---------------------------------------------------------------------------
create table public.reactions (
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'reply')),
  target_id   uuid not null,
  emoji       text not null check (emoji in ('with_you', 'hug', 'love', 'got_this', 'same_here')),
  created_at  timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);
create index reactions_target_idx on public.reactions (target_type, target_id);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'reply')),
  target_id   uuid not null,
  reason      text not null
                check (reason in ('harassment', 'hateful', 'sexual_content', 'self_harm_risk', 'spam', 'other')),
  note        text check (note is null or char_length(note) <= 500),
  status      text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  created_at  timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);
create index reports_target_idx on public.reports (target_type, target_id);

-- ---------------------------------------------------------------------------
-- blocks: created only through block_author() so the app never handles
-- another user's id.
-- ---------------------------------------------------------------------------
create table public.blocks (
  id         uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.saves (
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  post_id    uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- ---------------------------------------------------------------------------
-- scenario_progress: scenarios themselves live in content/scenarios/*.json
-- ---------------------------------------------------------------------------
create table public.scenario_progress (
  user_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  scenario_id  text not null,
  current_node text not null,
  path         jsonb not null default '[]'::jsonb,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, scenario_id)
);

-- ---------------------------------------------------------------------------
-- professional help
-- ---------------------------------------------------------------------------
create table public.professionals (
  id                uuid primary key default gen_random_uuid(),
  type              text not null check (type in ('therapist', 'intimacy_coach', 'legal_advisor')),
  name              text not null,
  bio               text not null default '',
  qualifications    text not null default '',
  languages         text[] not null default '{}',
  focus_areas       text[] not null default '{}',
  availability_note text not null default '',
  image_url         text,
  active            boolean not null default true,
  placeholder       boolean not null default false
);

create table public.help_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.professionals (id) on delete cascade,
  type            text not null check (type in ('therapist', 'intimacy_coach', 'legal_advisor')),
  topic           text not null check (char_length(topic) <= 80),
  message         text not null check (char_length(btrim(message)) >= 1 and char_length(message) <= 800),
  language        text not null check (char_length(language) <= 40),
  time_window     text not null check (char_length(time_window) <= 40),
  status          text not null default 'sent' check (status in ('sent', 'accepted', 'scheduled', 'closed')),
  created_at      timestamptz not null default now()
);
create index help_requests_user_idx on public.help_requests (user_id, created_at desc);

create table public.help_messages (
  id         uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.help_requests (id) on delete cascade,
  sender     text not null default 'user' check (sender in ('user', 'staff')),
  body       text not null check (char_length(btrim(body)) >= 1 and char_length(body) <= 800),
  created_at timestamptz not null default now()
);
create index help_messages_request_idx on public.help_messages (request_id, created_at);

-- ---------------------------------------------------------------------------
-- moderation_terms: the automatic filter's word and pattern list.
--   category  block     -> posts go to review; usernames are refused
--             review    -> posts go to review
--             self_harm -> posts go to review first in line, author sees helplines
--   is_word   true  = a word or phrase, matched on word boundaries
--             false = a raw regular expression (phone numbers, links, ...)
-- ---------------------------------------------------------------------------
create table public.moderation_terms (
  id       uuid primary key default gen_random_uuid(),
  pattern  text not null unique,
  category text not null check (category in ('block', 'review', 'self_harm')),
  reason   text not null default 'other',
  is_word  boolean not null default true
);
