-- 0007_reply_threads.sql
-- Lets the person who wrote a post answer the replies they received.
--
--   * a reply can now point at another reply (parent_id); that makes it a "response"
--   * only the author of the post can write a response, and only to an approved,
--     top-level reply on their own post. The database checks this, not the app.
--   * responses wait for a moderator like every other reply
--   * readers learn one new thing: by_author, true when a reply was written by
--     the same person who wrote the post. Still no user id and no username.

alter table public.replies
  add column parent_id uuid references public.replies (id) on delete cascade;
create index replies_parent_idx on public.replies (parent_id);

alter table public.replies drop constraint if exists replies_kind_check;
alter table public.replies
  add constraint replies_kind_check check (kind in ('advice', 'solidarity', 'response')),
  add constraint replies_response_shape check ((kind = 'response') = (parent_id is not null));

grant insert (parent_id) on public.replies to authenticated;

create or replace function private.replies_before_insert()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_hit record;
  v_parent record;
begin
  if v_uid is null then
    return new;
  end if;
  if public.is_banned() then
    raise exception 'banned';
  end if;

  if new.parent_id is not null then
    select r.post_id, r.status, r.parent_id, p.author_id as post_author
      into v_parent
      from public.replies r
      join public.posts p on p.id = r.post_id
      where r.id = new.parent_id;
    if not found
       or v_parent.status <> 'approved'
       or v_parent.parent_id is not null
       or v_parent.post_author is distinct from v_uid then
      raise exception 'cannot_respond';
    end if;
    new.post_id := v_parent.post_id;
    new.question_id := null;
    new.kind := 'response';
  elsif new.kind = 'response' then
    raise exception 'cannot_respond';
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

alter type public.reply_card
  add attribute parent_id uuid,
  add attribute by_author boolean;

create or replace function public.list_replies(
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
      where x.target_type = 'reply' and x.target_id = r.id and x.user_id = auth.uid()),
    r.parent_id,
    coalesce((select p.author_id = r.author_id from public.posts p where p.id = r.post_id), false)
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
