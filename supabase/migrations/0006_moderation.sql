-- 0006_moderation.sql
-- Moderator tools, weekly questions, help-request inbox and account deletion.
-- Every function here checks is_moderator() itself (except delete_my_account),
-- so hiding a button in the app is never the only thing stopping someone.
-- None of the queue functions return who wrote anything.

create type public.mod_item as (
  target_type       text,      -- 'post' | 'reply'
  id                uuid,
  kind              text,      -- confession | space_post | advice | solidarity
  body              text,
  status            text,
  moderation_reason text,
  priority          boolean,
  is_seed           boolean,
  created_at        timestamptz,
  context           text,      -- for a reply: the post or question it answers
  report_count      int,
  report_reasons    text[]
);

-- p_tab: 'replies' (waiting for approval) | 'posts' (held or hidden) | 'reports' (open reports)
create function public.mod_queue(p_tab text)
returns setof public.mod_item
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_moderator() then
    raise exception 'moderators_only';
  end if;

  return query
  with items as (
    select 'post'::text as target_type, p.id, p.kind, p.body, p.status, p.moderation_reason,
           p.priority, p.is_seed, p.created_at, null::text as context
    from public.posts p
    union all
    select 'reply'::text, r.id, r.kind, r.body, r.status, r.moderation_reason,
           r.priority, r.is_seed, r.created_at,
           coalesce(
             (select left(p.body, 280) from public.posts p where p.id = r.post_id),
             (select q.question from public.weekly_questions q where q.id = r.question_id)
           )
    from public.replies r
  ),
  counted as (
    select i.*,
           (select count(*) from public.reports x
             where x.target_type = i.target_type and x.target_id = i.id and x.status = 'open')::int as report_count,
           (select coalesce(array_agg(distinct x.reason), '{}') from public.reports x
             where x.target_type = i.target_type and x.target_id = i.id and x.status = 'open') as report_reasons
    from items i
  )
  select c.target_type, c.id, c.kind, c.body, c.status, c.moderation_reason, c.priority,
         c.is_seed, c.created_at, c.context, c.report_count, c.report_reasons
  from counted c
  where case p_tab
          when 'replies' then c.target_type = 'reply' and c.status = 'pending'
          when 'posts'   then c.target_type = 'post' and c.status in ('pending', 'hidden')
          when 'reports' then c.report_count > 0
          else false
        end
  order by c.priority desc, c.created_at asc;
end;
$$;

-- Approve or reject a post or reply. p_reason is the guideline it broke.
create function public.mod_review(
  p_target_type text,
  p_target_id   uuid,
  p_approve     boolean,
  p_reason      text default null
)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_moderator() then
    raise exception 'moderators_only';
  end if;

  if p_target_type = 'post' then
    update public.posts
    set status = case when p_approve then 'published' else 'rejected' end,
        moderation_reason = case when p_approve then null else coalesce(p_reason, 'other') end,
        priority = false,
        featured_on = case when p_approve then featured_on end
    where id = p_target_id;
  elsif p_target_type = 'reply' then
    update public.replies
    set status = case when p_approve then 'approved' else 'rejected' end,
        moderation_reason = case when p_approve then null else coalesce(p_reason, 'other') end,
        priority = false,
        highlighted = case when p_approve then highlighted else false end
    where id = p_target_id;
  else
    raise exception 'unknown_target';
  end if;

  update public.reports
  set status = case when p_approve then 'dismissed' else 'actioned' end
  where target_type = p_target_type and target_id = p_target_id and status = 'open';
end;
$$;

-- Ban whoever wrote a post or reply, without the moderator learning who it is.
-- p_days null = permanent.
create function public.mod_ban_author(
  p_target_type text,
  p_target_id   uuid,
  p_days        int default null
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_author uuid;
begin
  if not public.is_moderator() then
    raise exception 'moderators_only';
  end if;
  if p_target_type = 'post' then
    v_author := (select p.author_id from public.posts p where p.id = p_target_id);
  elsif p_target_type = 'reply' then
    v_author := (select r.author_id from public.replies r where r.id = p_target_id);
  end if;
  if v_author is null then
    return;
  end if;

  update public.profiles
  set banned_until = case when p_days is null then 'infinity'::timestamptz
                          else now() + make_interval(days => p_days) end
  where id = v_author and role <> 'moderator';
end;
$$;

-- Pin one published confession as today's confession of the day.
create function public.mod_set_featured(p_post_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  if not public.is_moderator() then
    raise exception 'moderators_only';
  end if;
  if not exists (
    select 1 from public.posts p
    where p.id = p_post_id and p.kind = 'confession' and p.status = 'published'
  ) then
    raise exception 'not_a_published_confession';
  end if;
  update public.posts set featured_on = null where featured_on = v_today;
  update public.posts set featured_on = v_today where id = p_post_id;
end;
$$;

create function public.mod_set_highlight(p_reply_id uuid, p_on boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_moderator() then
    raise exception 'moderators_only';
  end if;
  update public.replies set highlighted = p_on where id = p_reply_id and status = 'approved';
end;
$$;

-- Set (or replace) this week's pinned question for a space.
create function public.mod_set_weekly_question(p_space_id uuid, p_question text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_week date := date_trunc('week', now() at time zone 'Asia/Kolkata')::date;
begin
  if not public.is_moderator() then
    raise exception 'moderators_only';
  end if;
  insert into public.weekly_questions (space_id, question, week_start, created_by)
  values (p_space_id, btrim(p_question), v_week, auth.uid())
  on conflict (space_id, week_start) do update set question = excluded.question;
end;
$$;

-- The help-request inbox. Staff see the anonymous username and the request, nothing else.
create function public.mod_help_requests()
returns table (
  id uuid, username text, professional_name text, type text, topic text, message text,
  language text, time_window text, status text, created_at timestamptz
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_moderator() then
    raise exception 'moderators_only';
  end if;
  return query
  select h.id, u.username, pr.name, h.type, h.topic, h.message,
         h.language, h.time_window, h.status, h.created_at
  from public.help_requests h
  join public.profiles u on u.id = h.user_id
  join public.professionals pr on pr.id = h.professional_id
  order by (h.status = 'closed'), h.created_at desc;
end;
$$;

-- Deletes the signed-in account and, through the cascades set up in 0001,
-- every post, reply, reaction, report, save, block and help request it owns.
create function public.delete_my_account()
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_signed_in';
  end if;
  delete from auth.users where id = v_uid;
end;
$$;

revoke execute on function public.mod_queue(text) from public, anon;
revoke execute on function public.mod_review(text, uuid, boolean, text) from public, anon;
revoke execute on function public.mod_ban_author(text, uuid, int) from public, anon;
revoke execute on function public.mod_set_featured(uuid) from public, anon;
revoke execute on function public.mod_set_highlight(uuid, boolean) from public, anon;
revoke execute on function public.mod_set_weekly_question(uuid, text) from public, anon;
revoke execute on function public.mod_help_requests() from public, anon;
revoke execute on function public.delete_my_account() from public, anon;

grant execute on function public.mod_queue(text) to authenticated;
grant execute on function public.mod_review(text, uuid, boolean, text) to authenticated;
grant execute on function public.mod_ban_author(text, uuid, int) to authenticated;
grant execute on function public.mod_set_featured(uuid) to authenticated;
grant execute on function public.mod_set_highlight(uuid, boolean) to authenticated;
grant execute on function public.mod_set_weekly_question(uuid, text) to authenticated;
grant execute on function public.mod_help_requests() to authenticated;
grant execute on function public.delete_my_account() to authenticated;
