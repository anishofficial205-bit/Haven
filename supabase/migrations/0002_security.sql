-- 0002_security.sql
-- Helper functions, triggers, Row Level Security and grants.
--
-- The rule that matters most: no query from the app can return another user's
-- author_id or username alongside their content. So:
--   * posts / replies / reactions can only be read directly by their owner
--   * everyone else reads through the functions in 0003, which never return
--     author_id or username
--   * clients may only write the columns granted below; status, role,
--     highlighted, featured_on and author_id are set by the database

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Helpers used by policies
-- ---------------------------------------------------------------------------
create function public.is_moderator()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'moderator'
  );
$$;

create function public.is_banned()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and banned_until is not null and banned_until > now()
  );
$$;

-- ---------------------------------------------------------------------------
-- Automatic filter
-- ---------------------------------------------------------------------------
-- Returns the most serious match for a piece of text, or no row if it's clean.
create function private.moderation_scan(p_text text)
returns table (category text, reason text)
language sql stable security definer set search_path = ''
as $$
  select t.category, t.reason
  from public.moderation_terms t
  where t.reason <> 'reserved'
    and p_text ~* (case when t.is_word then '\m(?:' || t.pattern || ')\M' else t.pattern end)
  order by case t.category when 'self_harm' then 0 when 'block' then 1 else 2 end
  limit 1;
$$;

-- Usernames have no spaces, so words are matched anywhere inside them.
create function private.username_blocked(p_username text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.moderation_terms t
    where t.is_word and t.category <> 'self_harm'
      and p_username ~* t.pattern
  );
$$;

-- 'ok' | 'invalid' | 'blocked' | 'taken'. Callable before sign-up.
create function public.username_available(p_username text)
returns text
language plpgsql stable security definer set search_path = ''
as $$
begin
  if p_username is null or p_username !~ '^[A-Za-z0-9_]{3,20}$' then
    return 'invalid';
  end if;
  if private.username_blocked(p_username) then
    return 'blocked';
  end if;
  if exists (select 1 from public.profiles where lower(username) = lower(p_username)) then
    return 'taken';
  end if;
  return 'ok';
end;
$$;

-- A broken pattern would make every post fail, so refuse it up front.
create function private.moderation_terms_validate()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform '' ~* (case when new.is_word then '\m(?:' || new.pattern || ')\M' else new.pattern end);
  return new;
exception when others then
  raise exception 'That pattern is not a valid regular expression: %', new.pattern;
end;
$$;
create trigger moderation_terms_validate
  before insert or update on public.moderation_terms
  for each row execute function private.moderation_terms_validate();

-- ---------------------------------------------------------------------------
-- Accounts: create the profile when the auth user is created
-- ---------------------------------------------------------------------------
create function private.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_username text := new.raw_user_meta_data ->> 'username';
  v_age_band text := new.raw_user_meta_data ->> 'age_band';
  v_avatar   smallint := coalesce((new.raw_user_meta_data ->> 'avatar_id')::smallint, 1);
begin
  if v_username is null or v_username !~ '^[A-Za-z0-9_]{3,20}$' then
    raise exception 'username_invalid';
  end if;
  -- Never store a real email: accounts use <username>@users.invalid only.
  if new.email is distinct from lower(v_username) || '@users.invalid' then
    raise exception 'email_not_allowed';
  end if;
  if private.username_blocked(v_username) then
    raise exception 'username_blocked';
  end if;
  if exists (select 1 from public.profiles where lower(username) = lower(v_username)) then
    raise exception 'username_taken';
  end if;

  insert into public.profiles (id, username, avatar_id, age_band)
  values (new.id, v_username, v_avatar, v_age_band);
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create function private.profiles_before_update()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.consent_version is distinct from old.consent_version then
    new.consent_at := now();
  end if;
  return new;
end;
$$;
create trigger profiles_before_update
  before update on public.profiles
  for each row execute function private.profiles_before_update();

-- ---------------------------------------------------------------------------
-- Posts and replies: the database decides author and status, not the client
-- ---------------------------------------------------------------------------
create function private.posts_before_insert()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_hit record;
begin
  -- No signed-in user means the SQL editor or the service role (seed data).
  if v_uid is null then
    return new;
  end if;
  if public.is_banned() then
    raise exception 'banned';
  end if;

  new.author_id := v_uid;
  new.is_seed := false;
  new.featured_on := null;
  new.created_at := now();
  new.status := 'published';
  new.moderation_reason := null;
  new.priority := false;

  select * into v_hit from private.moderation_scan(new.body);
  if found then
    new.status := 'pending';
    new.moderation_reason := v_hit.reason;
    new.priority := (v_hit.category = 'self_harm');
  end if;
  return new;
end;
$$;
create trigger posts_before_insert
  before insert on public.posts
  for each row execute function private.posts_before_insert();

create function private.replies_before_insert()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_hit record;
begin
  if v_uid is null then
    return new;
  end if;
  if public.is_banned() then
    raise exception 'banned';
  end if;

  new.author_id := v_uid;
  new.is_seed := false;
  new.highlighted := false;
  new.created_at := now();
  new.status := 'pending'; -- every reply waits for a moderator
  new.moderation_reason := null;
  new.priority := false;

  select * into v_hit from private.moderation_scan(new.body);
  if found then
    new.moderation_reason := v_hit.reason;
    new.priority := (v_hit.category = 'self_harm');
  end if;
  return new;
end;
$$;
create trigger replies_before_insert
  before insert on public.replies
  for each row execute function private.replies_before_insert();

-- reactions and reports point at posts or replies by id, so tidy them up here
create function private.cleanup_target()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.reactions where target_type = tg_argv[0] and target_id = old.id;
  delete from public.reports where target_type = tg_argv[0] and target_id = old.id;
  return old;
end;
$$;
create trigger posts_cleanup after delete on public.posts
  for each row execute function private.cleanup_target('post');
create trigger replies_cleanup after delete on public.replies
  for each row execute function private.cleanup_target('reply');

-- ---------------------------------------------------------------------------
-- Reports: hide content once 3 different people have reported it
-- ---------------------------------------------------------------------------
create function private.reports_after_insert()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_count int;
begin
  select count(distinct reporter_id) into v_count
  from public.reports
  where target_type = new.target_type and target_id = new.target_id and status = 'open';

  if v_count >= 3 then
    if new.target_type = 'post' then
      update public.posts set status = 'hidden', moderation_reason = 'reported'
      where id = new.target_id and status = 'published';
    else
      update public.replies set status = 'hidden', moderation_reason = 'reported'
      where id = new.target_id and status = 'approved';
    end if;
  end if;
  return new;
end;
$$;
create trigger reports_after_insert
  after insert on public.reports
  for each row execute function private.reports_after_insert();

-- ---------------------------------------------------------------------------
-- Blocking: the app passes the post or reply, never a user id
-- ---------------------------------------------------------------------------
create function public.block_author(p_target_type text, p_target_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_author uuid;
begin
  if v_uid is null then
    raise exception 'not_signed_in';
  end if;
  if p_target_type = 'post' then
    select author_id into v_author from public.posts where id = p_target_id;
  elsif p_target_type = 'reply' then
    select author_id into v_author from public.replies where id = p_target_id;
  end if;
  -- Seed content and your own content: nothing to block, and no error either,
  -- so the response never hints at who wrote something.
  if v_author is null or v_author = v_uid then
    return;
  end if;
  insert into public.blocks (blocker_id, blocked_id)
  values (v_uid, v_author)
  on conflict do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- Help threads: the database decides who the sender is
-- ---------------------------------------------------------------------------
create function private.help_messages_before_insert()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
begin
  if v_uid is null then
    return new;
  end if;
  select user_id into v_owner from public.help_requests where id = new.request_id;
  if v_owner = v_uid then
    new.sender := 'user';
  elsif public.is_moderator() then
    new.sender := 'staff';
  else
    raise exception 'not_allowed';
  end if;
  new.created_at := now();
  return new;
end;
$$;
create trigger help_messages_before_insert
  before insert on public.help_messages
  for each row execute function private.help_messages_before_insert();

create function private.touch_updated_at()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger scenario_progress_touch
  before update on public.scenario_progress
  for each row execute function private.touch_updated_at();

-- ===========================================================================
-- Row Level Security: on for every table
-- ===========================================================================
alter table public.profiles          enable row level security;
alter table public.spaces            enable row level security;
alter table public.space_members     enable row level security;
alter table public.posts             enable row level security;
alter table public.weekly_questions  enable row level security;
alter table public.replies           enable row level security;
alter table public.reactions         enable row level security;
alter table public.reports           enable row level security;
alter table public.blocks            enable row level security;
alter table public.saves             enable row level security;
alter table public.scenario_progress enable row level security;
alter table public.professionals     enable row level security;
alter table public.help_requests     enable row level security;
alter table public.help_messages     enable row level security;
alter table public.moderation_terms  enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_moderator());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- spaces, professionals: public read
create policy spaces_read on public.spaces for select to anon, authenticated using (true);
create policy professionals_read on public.professionals for select to anon, authenticated
  using (active);

-- space_members: owner only
create policy space_members_select on public.space_members for select to authenticated
  using (user_id = (select auth.uid()));
create policy space_members_insert on public.space_members for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy space_members_delete on public.space_members for delete to authenticated
  using (user_id = (select auth.uid()));

-- posts: direct access is owner only. Everyone else reads through 0003.
create policy posts_select_own on public.posts for select to authenticated
  using (author_id = (select auth.uid()));
create policy posts_insert_own on public.posts for insert to authenticated
  with check (author_id = (select auth.uid()) and not public.is_banned());
create policy posts_delete_own on public.posts for delete to authenticated
  using (author_id = (select auth.uid()));

-- replies: same shape as posts
create policy replies_select_own on public.replies for select to authenticated
  using (author_id = (select auth.uid()));
create policy replies_insert_own on public.replies for insert to authenticated
  with check (author_id = (select auth.uid()) and not public.is_banned());
create policy replies_delete_own on public.replies for delete to authenticated
  using (author_id = (select auth.uid()));

-- reactions: owner only (counts come from 0003)
create policy reactions_select_own on public.reactions for select to authenticated
  using (user_id = (select auth.uid()));
create policy reactions_insert_own on public.reactions for insert to authenticated
  with check (user_id = (select auth.uid()) and not public.is_banned());
create policy reactions_update_own on public.reactions for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and not public.is_banned());
create policy reactions_delete_own on public.reactions for delete to authenticated
  using (user_id = (select auth.uid()));

-- reports: you can file them and see your own
create policy reports_select_own on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()));
create policy reports_insert_own on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));

-- blocks: see and remove your own; created only by block_author()
create policy blocks_select_own on public.blocks for select to authenticated
  using (blocker_id = (select auth.uid()));
create policy blocks_delete_own on public.blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));

-- saves: owner only
create policy saves_select_own on public.saves for select to authenticated
  using (user_id = (select auth.uid()));
create policy saves_insert_own on public.saves for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy saves_delete_own on public.saves for delete to authenticated
  using (user_id = (select auth.uid()));

-- weekly_questions: everyone signed in reads, moderators write
create policy weekly_questions_read on public.weekly_questions for select to authenticated
  using (true);
create policy weekly_questions_insert_mod on public.weekly_questions for insert to authenticated
  with check (public.is_moderator());
create policy weekly_questions_update_mod on public.weekly_questions for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());
create policy weekly_questions_delete_mod on public.weekly_questions for delete to authenticated
  using (public.is_moderator());

-- scenario_progress: owner only
create policy scenario_progress_select on public.scenario_progress for select to authenticated
  using (user_id = (select auth.uid()));
create policy scenario_progress_insert on public.scenario_progress for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy scenario_progress_update on public.scenario_progress for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy scenario_progress_delete on public.scenario_progress for delete to authenticated
  using (user_id = (select auth.uid()));

-- help_requests / help_messages: owner and moderators only
create policy help_requests_select on public.help_requests for select to authenticated
  using (user_id = (select auth.uid()) or public.is_moderator());
create policy help_requests_insert_own on public.help_requests for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy help_requests_update_mod on public.help_requests for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());

create policy help_messages_select on public.help_messages for select to authenticated
  using (
    public.is_moderator()
    or exists (
      select 1 from public.help_requests r
      where r.id = request_id and r.user_id = (select auth.uid())
    )
  );
create policy help_messages_insert on public.help_messages for insert to authenticated
  with check (
    public.is_moderator()
    or exists (
      select 1 from public.help_requests r
      where r.id = request_id and r.user_id = (select auth.uid())
    )
  );

-- moderation_terms: moderators only
create policy moderation_terms_mod on public.moderation_terms for all to authenticated
  using (public.is_moderator()) with check (public.is_moderator());

-- ===========================================================================
-- Grants. Supabase gives anon/authenticated full table access by default and
-- relies on RLS alone; we take that away and grant column by column, so a
-- client cannot set status, role, highlighted, featured_on or author_id.
-- ===========================================================================
revoke all on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;

grant select (id, username, avatar_id, age_band, role, consent_version, consent_at, banned_until, created_at),
      update (avatar_id, consent_version)
  on public.profiles to authenticated;

grant select on public.spaces to anon, authenticated;
grant select on public.professionals to anon, authenticated;

grant select, delete on public.space_members to authenticated;
grant insert (space_id) on public.space_members to authenticated;

grant select, delete on public.posts to authenticated;
grant insert (kind, space_id, post_type, body, tags, trigger_warnings) on public.posts to authenticated;

grant select, delete on public.replies to authenticated;
grant insert (post_id, question_id, kind, body) on public.replies to authenticated;

grant select, delete on public.reactions to authenticated;
grant insert (target_type, target_id, emoji), update (emoji) on public.reactions to authenticated;

grant select on public.reports to authenticated;
grant insert (target_type, target_id, reason, note) on public.reports to authenticated;

-- blocked_id is deliberately not readable: it is someone else's identity
grant select (id, blocker_id, created_at), delete on public.blocks to authenticated;

grant select, delete on public.saves to authenticated;
grant insert (post_id) on public.saves to authenticated;

grant select (id, space_id, question, week_start), delete on public.weekly_questions to authenticated;
grant insert (space_id, question, week_start), update (question) on public.weekly_questions to authenticated;

grant select, delete on public.scenario_progress to authenticated;
grant insert (scenario_id, current_node, path, completed_at),
      update (current_node, path, completed_at)
  on public.scenario_progress to authenticated;

grant select on public.help_requests to authenticated;
grant insert (professional_id, type, topic, message, language, time_window), update (status)
  on public.help_requests to authenticated;

grant select on public.help_messages to authenticated;
grant insert (request_id, body) on public.help_messages to authenticated;

grant select, insert, update, delete on public.moderation_terms to authenticated;

-- Functions: nothing is callable unless listed here
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.is_moderator() to authenticated;
grant execute on function public.is_banned() to authenticated;
grant execute on function public.block_author(text, uuid) to authenticated;
