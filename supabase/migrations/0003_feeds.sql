-- 0003_feeds.sql
-- The only way to read other people's posts and replies.
-- These functions never return author_id or username. `is_mine` is the only
-- thing that says anything about authorship, and only to the author.

create type public.post_card as (
  id                uuid,
  kind              text,
  space_id          uuid,
  post_type         text,
  body              text,
  tags              text[],
  trigger_warnings  text[],
  status            text,
  moderation_reason text,     -- only filled in for the author
  featured_on       date,
  is_seed           boolean,
  created_at        timestamptz,
  is_mine           boolean,
  is_saved          boolean,
  reaction_counts   jsonb,    -- {"hug": 3, "with_you": 1}
  reaction_total    int,
  my_reaction       text,
  reply_count       int,
  advice_count      int
);

create type public.reply_card as (
  id                uuid,
  post_id           uuid,
  question_id       uuid,
  kind              text,
  body              text,
  status            text,
  moderation_reason text,     -- only filled in for the author
  highlighted       boolean,
  created_at        timestamptz,
  is_mine           boolean,
  reaction_counts   jsonb,
  reaction_total    int,
  my_reaction       text
);

-- Every post the current user is allowed to see: published ones, plus their
-- own in any state, minus anything written by someone they blocked.
create function private.post_cards()
returns setof public.post_card
language sql stable security definer set search_path = ''
as $$
  select
    p.id, p.kind, p.space_id, p.post_type, p.body, p.tags, p.trigger_warnings, p.status,
    case when p.author_id = auth.uid() then p.moderation_reason end,
    p.featured_on, p.is_seed, p.created_at,
    coalesce(p.author_id = auth.uid(), false),
    exists (select 1 from public.saves s where s.post_id = p.id and s.user_id = auth.uid()),
    coalesce((
      select jsonb_object_agg(x.emoji, x.n)
      from (
        select r.emoji, count(*) as n from public.reactions r
        where r.target_type = 'post' and r.target_id = p.id
        group by r.emoji
      ) x
    ), '{}'::jsonb),
    (select count(*) from public.reactions r
      where r.target_type = 'post' and r.target_id = p.id)::int,
    (select r.emoji from public.reactions r
      where r.target_type = 'post' and r.target_id = p.id and r.user_id = auth.uid()),
    (select count(*) from public.replies r
      where r.post_id = p.id and r.status = 'approved')::int,
    (select count(*) from public.replies r
      where r.post_id = p.id and r.status = 'approved' and r.kind = 'advice')::int
  from public.posts p
  where auth.uid() is not null
    and (p.status = 'published' or p.author_id = auth.uid())
    and not exists (
      select 1 from public.blocks b
      where b.blocker_id = auth.uid() and b.blocked_id = p.author_id
    );
$$;

-- p_sort: 'recent' | 'supported' | 'advice' (only posts with advice replies)
create function public.feed_confessions(
  p_tag    text default null,
  p_sort   text default 'recent',
  p_limit  int  default 20,
  p_offset int  default 0
)
returns setof public.post_card
language sql stable security definer set search_path = ''
as $$
  select c.*
  from private.post_cards() c
  where c.kind = 'confession'
    and c.status in ('published', 'pending')
    and (p_tag is null or p_tag = any (c.tags))
    and (p_sort is distinct from 'advice' or c.advice_count > 0)
  order by
    case when p_sort = 'supported' then c.reaction_total end desc nulls last,
    c.created_at desc
  limit least(greatest(p_limit, 1), 50) offset greatest(p_offset, 0);
$$;

-- p_sort: 'recent' | 'supported' | 'replies'
create function public.feed_space(
  p_space_id uuid,
  p_tag      text default null,
  p_sort     text default 'recent',
  p_limit    int  default 20,
  p_offset   int  default 0
)
returns setof public.post_card
language sql stable security definer set search_path = ''
as $$
  select c.*
  from private.post_cards() c
  where c.kind = 'space_post'
    and c.space_id = p_space_id
    and c.status in ('published', 'pending')
    and (p_tag is null or p_tag = any (c.tags))
  order by
    case when p_sort = 'supported' then c.reaction_total end desc nulls last,
    case when p_sort = 'replies' then c.reply_count end desc nulls last,
    c.created_at desc
  limit least(greatest(p_limit, 1), 50) offset greatest(p_offset, 0);
$$;

create function public.post_detail(p_post_id uuid)
returns setof public.post_card
language sql stable security definer set search_path = ''
as $$
  select c.* from private.post_cards() c where c.id = p_post_id;
$$;

create function public.my_posts()
returns setof public.post_card
language sql stable security definer set search_path = ''
as $$
  select c.* from private.post_cards() c where c.is_mine order by c.created_at desc;
$$;

create function public.saved_posts()
returns setof public.post_card
language sql stable security definer set search_path = ''
as $$
  select c.* from private.post_cards() c
  where c.is_saved and (c.status = 'published' or c.is_mine)
  order by c.created_at desc;
$$;

-- "Today" is the day in India, where the testers are.
create function public.confession_of_the_day()
returns setof public.post_card
language sql stable security definer set search_path = ''
as $$
  select c.* from private.post_cards() c
  where c.status = 'published'
    and c.featured_on = (now() at time zone 'Asia/Kolkata')::date
  limit 1;
$$;

-- Replies to a post or to a weekly question (pass exactly one).
-- Others see approved replies only; authors also see their own pending ones.
create function public.list_replies(
  p_post_id     uuid default null,
  p_question_id uuid default null
)
returns setof public.reply_card
language sql stable security definer set search_path = ''
as $$
  select
    r.id, r.post_id, r.question_id, r.kind, r.body, r.status,
    case when r.author_id = auth.uid() then r.moderation_reason end,
    r.highlighted, r.created_at,
    coalesce(r.author_id = auth.uid(), false),
    coalesce((
      select jsonb_object_agg(x.emoji, x.n)
      from (
        select x.emoji, count(*) as n from public.reactions x
        where x.target_type = 'reply' and x.target_id = r.id
        group by x.emoji
      ) x
    ), '{}'::jsonb),
    (select count(*) from public.reactions x
      where x.target_type = 'reply' and x.target_id = r.id)::int,
    (select x.emoji from public.reactions x
      where x.target_type = 'reply' and x.target_id = r.id and x.user_id = auth.uid())
  from public.replies r
  where auth.uid() is not null
    and num_nonnulls(p_post_id, p_question_id) = 1
    and (r.post_id = p_post_id or r.question_id = p_question_id)
    and (r.status = 'approved' or r.author_id = auth.uid())
    and (r.post_id is null or exists (select 1 from private.post_cards() c where c.id = r.post_id))
    and not exists (
      select 1 from public.blocks b
      where b.blocker_id = auth.uid() and b.blocked_id = r.author_id
    )
  order by r.highlighted desc, r.created_at asc;
$$;

revoke execute on all functions in schema public from public, anon;
grant execute on function public.username_available(text) to anon;
grant execute on function public.feed_confessions(text, text, int, int) to authenticated;
grant execute on function public.feed_space(uuid, text, text, int, int) to authenticated;
grant execute on function public.post_detail(uuid) to authenticated;
grant execute on function public.my_posts() to authenticated;
grant execute on function public.saved_posts() to authenticated;
grant execute on function public.confession_of_the_day() to authenticated;
grant execute on function public.list_replies(uuid, uuid) to authenticated;
