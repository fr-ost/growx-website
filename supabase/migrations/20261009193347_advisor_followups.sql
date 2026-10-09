-- Advisor follow-ups (Supabase security + performance linters). Safe to re-run.
--
-- 1. Trigger functions are not an API. This project's default privileges grant
--    EXECUTE on new public functions to anon/authenticated, which exposes them
--    under /rest/v1/rpc/*. Postgres refuses to run trigger functions outside a
--    trigger, but revoke anyway so they are not reachable at all. Triggers keep
--    working: EXECUTE is checked when a trigger is created, not when it fires.
-- 2. Index the subscriptions -> payments foreign key (unindexed_foreign_keys).

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;
revoke execute on function public.record_x_username() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

create index if not exists subscriptions_source_payment_idx
  on public.subscriptions (source_payment_id)
  where source_payment_id is not null;
