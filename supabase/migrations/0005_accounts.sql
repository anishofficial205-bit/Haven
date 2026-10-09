-- 0005_accounts.sql
-- Recovery codes: the only way back in if a password is lost, because the app
-- never collects an email or phone number.
--   * create_recovery_code()  signed-in user gets a fresh 12-character code, shown once.
--                             Only a one-way hash of it is stored.
--   * reset_password_with_recovery_code()  username + code + new password.
--                             Locks for 15 minutes after 5 wrong codes.

create extension if not exists pgcrypto with schema extensions;

alter table public.profiles
  add column if not exists recovery_attempts int not null default 0,
  add column if not exists recovery_locked_until timestamptz;

create or replace function public.create_recovery_code()
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  -- no 0/O, 1/I/L: they are too easy to mix up when writing a code down
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes bytea := extensions.gen_random_bytes(12);
  v_code text := '';
begin
  if v_uid is null then
    raise exception 'not_signed_in';
  end if;
  for i in 0..11 loop
    v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % length(v_alphabet)) + 1, 1);
  end loop;

  update public.profiles
  set recovery_code_hash = extensions.crypt(v_code, extensions.gen_salt('bf')),
      recovery_attempts = 0,
      recovery_locked_until = null
  where id = v_uid;

  return v_code;
end;
$$;

-- Returns 'ok' | 'invalid' | 'locked' | 'weak'.
-- 'invalid' covers both a wrong code and an unknown username, so the answer
-- never reveals whether a username exists.
create or replace function public.reset_password_with_recovery_code(
  p_username     text,
  p_code         text,
  p_new_password text
)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_hash text;
  v_locked timestamptz;
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if p_new_password is null or char_length(p_new_password) < 8 or char_length(p_new_password) > 72 then
    return 'weak';
  end if;

  v_id := (select p.id from public.profiles p where lower(p.username) = lower(p_username));
  if v_id is null then
    return 'invalid';
  end if;
  v_hash := (select p.recovery_code_hash from public.profiles p where p.id = v_id);
  v_locked := (select p.recovery_locked_until from public.profiles p where p.id = v_id);

  if v_locked is not null and v_locked > now() then
    return 'locked';
  end if;

  if v_hash is null or extensions.crypt(v_code, v_hash) <> v_hash then
    update public.profiles
    set recovery_attempts = recovery_attempts + 1,
        recovery_locked_until = case when recovery_attempts + 1 >= 5 then now() + interval '15 minutes' end
    where id = v_id;
    -- start counting afresh once a lock has been set
    update public.profiles set recovery_attempts = 0
    where id = v_id and recovery_locked_until is not null;
    return 'invalid';
  end if;

  update auth.users
  set encrypted_password = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      updated_at = now()
  where id = v_id;
  -- sign out every device that was using the old password
  delete from auth.sessions where user_id = v_id;

  update public.profiles
  set recovery_attempts = 0, recovery_locked_until = null
  where id = v_id;
  return 'ok';
end;
$$;

revoke execute on function public.create_recovery_code() from public, anon;
revoke execute on function public.reset_password_with_recovery_code(text, text, text) from public;
grant execute on function public.create_recovery_code() to authenticated;
grant execute on function public.reset_password_with_recovery_code(text, text, text) to anon, authenticated;
