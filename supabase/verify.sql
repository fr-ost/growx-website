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
  select 'every auth user has a profile',
         to_regclass('public.profiles') is not null
         and not exists (select 1 from auth.users u where not exists (select 1 from public.profiles p where p.id = u.id))
)
select item, ok from checks order by ok, item;
