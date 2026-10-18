-- READ-ONLY diagnostic. Paste into the Supabase SQL Editor of the project that
-- Vercel is connected to. Every row should show ok = true.
-- It reads catalog information and counts only; it returns no user data.
with checks(item, ok) as (
  select 'table public.' || t, to_regclass('public.' || t) is not null
  from unnest(array['profiles','x_profiles','x_profile_history','trials','subscriptions','payments','webhook_events','early_adopter_slots','checkout_orders','payment_adjustments']) t
  union all
  select 'column subscriptions.past_due_since',
         exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'subscriptions' and column_name = 'past_due_since')
  union all
  select 'column ' || c, exists (select 1 from information_schema.columns where table_schema = 'public' and (table_name || '.' || column_name) = c)
  from unnest(array['subscriptions.access_revoked_at','subscriptions.provider_updated_at','payments.order_id','payments.refunded_minor','webhook_events.result']) c
  union all
  select 'function public.' || f,
         exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = f)
  from unnest(array['start_trial','claim_early_adopter_slot','early_adopter_available','ensure_my_profile','handle_new_user','billing_apply','create_checkout_order','attach_order_ref','close_checkout_order','grant_crypto_period','early_adopter_state']) f
  union all
  select 'trigger on_auth_user_created', exists (select 1 from pg_trigger where tgname = 'on_auth_user_created')
  union all
  select 'RLS enabled on public.' || c.relname, c.relrowsecurity
  from pg_class c
  where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
    and c.relname in ('profiles','x_profiles','x_profile_history','trials','subscriptions','payments','webhook_events','early_adopter_slots','checkout_orders')
  union all
  select 'authenticated can SELECT public.' || t,
         to_regclass('public.' || t) is not null and has_table_privilege('authenticated', 'public.' || t, 'SELECT')
  from unnest(array['profiles','x_profiles','trials','subscriptions','payments']) t
  union all
  select 'anon has NO access to public.' || t,
         to_regclass('public.' || t) is null or not has_table_privilege('anon', 'public.' || t, 'SELECT')
  from unnest(array['profiles','x_profiles','trials','subscriptions','payments']) t
  union all
  select 'authenticated can SELECT public.checkout_orders', to_regclass('public.checkout_orders') is not null and has_table_privilege('authenticated', 'public.checkout_orders', 'SELECT')
  union all
  select 'authenticated can NOT write public.' || t,
         to_regclass('public.' || t) is null or not (has_table_privilege('authenticated', 'public.' || t, 'INSERT') or has_table_privilege('authenticated', 'public.' || t, 'UPDATE') or has_table_privilege('authenticated', 'public.' || t, 'DELETE'))
  from unnest(array['checkout_orders','payments','subscriptions','trials','webhook_events','early_adopter_slots']) t
  union all
  select 'authenticated can NOT execute public.' || f,
         to_regprocedure('public.' || f) is null or not has_function_privilege('authenticated', to_regprocedure('public.' || f), 'EXECUTE')
  from unnest(array['billing_apply(text,text,text,timestamptz,jsonb)','early_adopter_state()','create_checkout_order(uuid,text,text,text,bigint,text,text,integer,integer)','grant_crypto_period(uuid,text,integer,uuid)']) f
  union all
  -- X account bindings + slots (20261016100712_x_account_bindings)
  select 'table public.' || t || ' (RLS on, authenticated read-only, no anon)',
         to_regclass('public.' || t) is not null
         and (select relrowsecurity from pg_class where oid = to_regclass('public.' || t))
         and has_table_privilege('authenticated', 'public.' || t, 'SELECT')
         and not (has_table_privilege('authenticated', 'public.' || t, 'INSERT') or has_table_privilege('authenticated', 'public.' || t, 'UPDATE') or has_table_privilege('authenticated', 'public.' || t, 'DELETE'))
         and not has_table_privilege('anon', 'public.' || t, 'SELECT')
  from unnest(array['x_account_bindings','x_account_binding_events','account_slot_grants']) t
  union all
  select 'global unique index on active X usernames',
         exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'x_account_bindings_active_username_key' and indexdef ilike '%unique%')
  union all
  select 'X binding guard trigger', exists (select 1 from pg_trigger where tgname = 'x_account_bindings_guard')
  union all
  select 'service_role may run register_x_account only', to_regprocedure('public.register_x_account(uuid,text)') is not null
         and has_function_privilege('service_role', to_regprocedure('public.register_x_account(uuid,text)'), 'EXECUTE')
         and not has_function_privilege('authenticated', to_regprocedure('public.register_x_account(uuid,text)'), 'EXECUTE')
  union all
  select 'no API role may run support_change_x_account', to_regprocedure('public.support_change_x_account(uuid,text,text,text,text)') is not null
         and not has_function_privilege('service_role', to_regprocedure('public.support_change_x_account(uuid,text,text,text,text)'), 'EXECUTE')
         and not has_function_privilege('authenticated', to_regprocedure('public.support_change_x_account(uuid,text,text,text,text)'), 'EXECUTE')
         and not has_function_privilege('anon', to_regprocedure('public.support_change_x_account(uuid,text,text,text,text)'), 'EXECUTE')
  union all
  -- admin: gifts + early-bird editor (20261016165539_admin_gifts_early_bird)
  select 'table public.' || t || ' (RLS on, no anon, no authenticated writes)',
         to_regclass('public.' || t) is not null
         and (select relrowsecurity from pg_class where oid = to_regclass('public.' || t))
         and not has_table_privilege('anon', 'public.' || t, 'SELECT')
         and not (has_table_privilege('authenticated', 'public.' || t, 'INSERT') or has_table_privilege('authenticated', 'public.' || t, 'UPDATE') or has_table_privilege('authenticated', 'public.' || t, 'DELETE'))
  from unnest(array['admins','premium_gifts','premium_gift_events','early_bird_settings','early_bird_events']) t
  union all
  select 'early_bird_settings has its one row', to_regclass('public.early_bird_settings') is not null and (select count(*) from public.early_bird_settings) = 1
  union all
  select 'authenticated can NOT execute public.' || f,
         to_regprocedure('public.' || f) is null or not has_function_privilege('authenticated', to_regprocedure('public.' || f), 'EXECUTE')
  from unnest(array['admin_grant_gift(uuid,uuid,text,text)','admin_extend_gift(uuid,uuid,text,text)','admin_revoke_gift(uuid,uuid,text)','admin_set_early_bird(uuid,integer,boolean,text,timestamptz)','admin_increase_early_bird_allocation(uuid,integer,text)','admin_find_user(uuid,text)','early_bird_status()','admin_change_x_account(uuid,uuid,text,text,text)']) f
  union all
  select 'every auth user has a profile',
         to_regclass('public.profiles') is not null
         and not exists (select 1 from auth.users u where not exists (select 1 from public.profiles p where p.id = u.id))
)
select item, ok from checks order by ok, item;
