-- reset.sql
-- Wipes everything this app created in the database, including all posts.
-- Afterwards, run the files in supabase/migrations again, in order.
--
-- This does NOT delete accounts. To remove those too, go to
-- Authentication > Users in the Supabase dashboard and delete them there.

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists
  public.help_messages,
  public.help_requests,
  public.professionals,
  public.scenario_progress,
  public.saves,
  public.blocks,
  public.reports,
  public.reactions,
  public.replies,
  public.weekly_questions,
  public.posts,
  public.space_members,
  public.spaces,
  public.moderation_terms,
  public.profiles
cascade;

drop function if exists public.feed_confessions(text, text, int, int);
drop function if exists public.feed_space(uuid, text, text, int, int);
drop function if exists public.post_detail(uuid);
drop function if exists public.my_posts();
drop function if exists public.saved_posts();
drop function if exists public.confession_of_the_day();
drop function if exists public.list_replies(uuid, uuid);
drop function if exists public.block_author(text, uuid);
drop function if exists public.mod_queue(text);
drop function if exists public.mod_review(text, uuid, boolean, text);
drop function if exists public.mod_ban_author(text, uuid, int);
drop function if exists public.mod_set_featured(uuid);
drop function if exists public.mod_set_highlight(uuid, boolean);
drop function if exists public.mod_set_weekly_question(uuid, text);
drop function if exists public.mod_help_requests();
drop function if exists public.delete_my_account();
drop function if exists public.create_recovery_code();
drop function if exists public.reset_password_with_recovery_code(text, text, text);
drop function if exists public.username_available(text);
drop function if exists public.is_moderator();
drop function if exists public.is_banned();

drop schema if exists private cascade;

drop type if exists public.post_card;
drop type if exists public.reply_card;
drop type if exists public.mod_item;
