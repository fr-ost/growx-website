-- Admin dashboard: correct or unlink a user's linked X username.
--
-- Additive: one new function. It is a thin, admin-checked wrapper around the existing audited support workflow
-- (public.support_change_x_account), so every rule stays enforced in one place: global uniqueness, atomic
-- replace (release + new link, all or nothing), "not_active" on repeats, and an audit row with the actor and reason.
-- The actor recorded is 'support:<admin email>'. support_change_x_account itself remains SQL-Editor only.

create or replace function public.admin_change_x_account(
  p_admin uuid, p_binding_id uuid, p_action text, p_reason text, p_new_username text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
begin
  if not public._is_admin(p_admin) then raise exception 'not_admin' using errcode = '42501'; end if;
  if p_action not in ('release', 'replace') then return jsonb_build_object('status', 'invalid_action'); end if;
  if length(btrim(coalesce(p_reason, ''))) < 10 then return jsonb_build_object('status', 'reason_required'); end if;
  select email into v_email from public.profiles where id = p_admin;
  begin
    return public.support_change_x_account(p_binding_id, p_action, 'support:' || coalesce(nullif(btrim(v_email), ''), p_admin::text), p_reason, p_new_username);
  exception when unique_violation then
    -- the new name was linked by someone else at the same moment; nothing was changed
    return jsonb_build_object('status', 'taken');
  end;
end;
$$;

revoke all on function public.admin_change_x_account(uuid, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_change_x_account(uuid, uuid, text, text, text) to service_role;
