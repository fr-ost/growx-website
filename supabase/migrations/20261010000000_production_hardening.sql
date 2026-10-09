-- Production hardening. Safe to run more than once; deletes nothing.
-- Requires the two earlier migrations (run them first, in order).
--
-- 1. Backfill profiles for auth users created before the on_auth_user_created
--    trigger existed (e.g. people who signed up before migrations were run).
--    Without a profile row, saving an X username or starting a trial fails
--    a foreign-key check.
-- 2. Explicit privileges. Newer Supabase projects may not grant table
--    privileges to API roles by default, so grant exactly what is needed.
-- 3. ensure_my_profile(): lets a signed-in user create THEIR OWN missing
--    profile row (id and email copied from auth.users, nothing user-supplied).

insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
on conflict (id) do nothing;

-- service_role: used only by server code (trial activation, health check,
-- future verified payment webhooks). It bypasses RLS by design.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- authenticated: re-assert the minimum (idempotent). RLS still limits every
-- row to its owner.
grant usage on schema public to authenticated;
grant select on public.profiles, public.x_profile_history, public.trials, public.subscriptions, public.payments
  to authenticated;
grant select, insert on public.x_profiles to authenticated;
grant update (x_username) on public.x_profiles to authenticated;

create or replace function public.ensure_my_profile()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  insert into public.profiles (id, email)
  select u.id, u.email from auth.users u where u.id = auth.uid()
  on conflict (id) do nothing;
end;
$$;

revoke all on function public.ensure_my_profile() from public, anon;
grant execute on function public.ensure_my_profile() to authenticated;
