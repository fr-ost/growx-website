-- Single active login per account.
-- Additive: one new table and three service-role-only functions. No existing rows
-- are read or changed; payments, subscriptions, trials and gifts are untouched.
--
-- Why a table AND revocation of Supabase sessions:
--   * Supabase access tokens are self-contained JWTs and stay cryptographically valid until
--     they expire, even after their session row is deleted. So every protected request also
--     compares the token's `session_id` claim with the active session recorded here, and
--     checks that the session still exists in auth.sessions.
--   * Deleting a row in auth.sessions cascades to auth.refresh_tokens, so a revoked session
--     can never refresh itself again. (Verified on this project: refresh_tokens_session_id_fkey
--     is ON DELETE CASCADE; the `postgres` role can delete from auth.sessions, `service_role`
--     cannot even read it, hence SECURITY DEFINER functions.)
--
-- Slots: by default a user has one active WEB session and one active EXTENSION session
-- (so using the website never logs out the extension). Strict mode (p_strict = true) uses a
-- single 'account' slot: one session across everything.

create table public.active_sessions (
  user_id      uuid not null references auth.users (id) on delete cascade,
  slot         text not null check (slot in ('web', 'extension', 'account')),
  session_id   uuid not null,
  activated_at timestamptz not null default now(),
  primary key (user_id, slot),
  -- a session can be the active session of at most one slot
  constraint active_sessions_session_key unique (session_id)
);

alter table public.active_sessions enable row level security;
-- No policies: API roles can neither read nor write. Only the functions below (and service_role) touch it.
revoke all on public.active_sessions from anon, authenticated;
grant select on public.active_sessions to service_role;

-- ---------------------------------------------------------------- helpers
create or replace function public._session_exists(p_user uuid, p_session uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.sessions s
     where s.id = p_session and s.user_id = p_user and (s.not_after is null or s.not_after > now())
  );
$$;

-- ---------------------------------------------------------------- register
-- Makes p_session the active session of its slot and revokes the previous one.
-- Everything happens under one per-user advisory lock, so concurrent logins are serialised:
-- exactly one session ends up active. A session that no longer exists in auth.sessions
-- (for example one revoked a moment ago) can NEVER become active.
-- Returns {status: 'active', revoked: n} | {status: 'session_not_found'}.
create or replace function public.register_active_session(p_user uuid, p_session uuid, p_client text, p_strict boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slot text := case when p_strict then 'account' else p_client end;
  v_old uuid;
  v_revoked integer := 0;
  v_n integer;
begin
  if p_client not in ('web', 'extension') then raise exception 'invalid_client'; end if;
  perform pg_advisory_xact_lock(hashtextextended('growx.active_session:' || p_user::text, 0));

  if not public._session_exists(p_user, p_session) then
    return jsonb_build_object('status', 'session_not_found');
  end if;

  select session_id into v_old from public.active_sessions where user_id = p_user and slot = v_slot;

  -- a session is active in one slot only
  delete from public.active_sessions where session_id = p_session and not (user_id = p_user and slot = v_slot);
  insert into public.active_sessions (user_id, slot, session_id)
  values (p_user, v_slot, p_session)
  on conflict (user_id, slot) do update set session_id = excluded.session_id, activated_at = now();

  if p_strict then
    delete from public.active_sessions where user_id = p_user and slot <> v_slot;
    -- one session across the whole account: drop every other Supabase session of THIS user
    delete from auth.sessions where user_id = p_user and id <> p_session;
    get diagnostics v_revoked = row_count;
  elsif v_old is not null and v_old <> p_session then
    delete from auth.sessions where user_id = p_user and id = v_old;
    get diagnostics v_n = row_count;
    v_revoked := v_n;
  end if;
  return jsonb_build_object('status', 'active', 'revoked', v_revoked);
end;
$$;

-- ------------------------------------------------------------------- check
-- 'active'  : this session is the active one and still exists.
-- 'revoked' : another session replaced it, or it no longer exists.
-- Rollout rule: a user with no active session recorded yet (logged in before this feature) lets
-- the first live session that checks claim the slot. After that, only a successful login replaces it.
create or replace function public.check_active_session(p_user uuid, p_session uuid, p_client text, p_strict boolean default false)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slot text := case when p_strict then 'account' else p_client end;
  v_has_row boolean;
begin
  if p_client not in ('web', 'extension') then raise exception 'invalid_client'; end if;

  -- fast path (no lock): the session is the active session of some slot
  if exists (select 1 from public.active_sessions where user_id = p_user and session_id = p_session) then
    return case when public._session_exists(p_user, p_session) then 'active' else 'revoked' end;
  end if;

  select exists (select 1 from public.active_sessions where user_id = p_user and (p_strict or slot = v_slot)) into v_has_row;
  if v_has_row then return 'revoked'; end if;
  if not public._session_exists(p_user, p_session) then return 'revoked'; end if;

  -- nothing recorded for this slot: claim it (under the lock, re-checking)
  perform pg_advisory_xact_lock(hashtextextended('growx.active_session:' || p_user::text, 0));
  select exists (select 1 from public.active_sessions where user_id = p_user and (p_strict or slot = v_slot)) into v_has_row;
  if v_has_row then
    return case when exists (select 1 from public.active_sessions where user_id = p_user and session_id = p_session) then 'active' else 'revoked' end;
  end if;
  insert into public.active_sessions (user_id, slot, session_id) values (p_user, v_slot, p_session)
  on conflict do nothing;
  return 'active';
end;
$$;

-- ----------------------------------------------------------------- release
-- Explicit logout: forget the active session and delete the Supabase session itself (so its
-- refresh tokens die too, even if the Auth API call that follows fails). Only this user's rows.
create or replace function public.release_active_session(p_user uuid, p_session uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('growx.active_session:' || p_user::text, 0));
  delete from public.active_sessions where user_id = p_user and session_id = p_session;
  get diagnostics v_n = row_count;
  delete from auth.sessions where user_id = p_user and id = p_session;
  return v_n > 0;
end;
$$;

-- --------------------------------------------------------------- privileges
revoke all on function public._session_exists(uuid, uuid) from public, anon, authenticated;
revoke all on function public.register_active_session(uuid, uuid, text, boolean) from public, anon, authenticated;
revoke all on function public.check_active_session(uuid, uuid, text, boolean) from public, anon, authenticated;
revoke all on function public.release_active_session(uuid, uuid) from public, anon, authenticated;
grant execute on function public._session_exists(uuid, uuid) to service_role;
grant execute on function public.register_active_session(uuid, uuid, text, boolean) to service_role;
grant execute on function public.check_active_session(uuid, uuid, text, boolean) to service_role;
grant execute on function public.release_active_session(uuid, uuid) to service_role;
