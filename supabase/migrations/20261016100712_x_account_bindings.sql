-- Permanent X account bindings, account slots and the paid $0.99 slot add-on.
--
-- Additive and non-destructive:
--   * three NEW tables (x_account_bindings, x_account_binding_events, account_slot_grants), all empty:
--     no username is linked by this migration, nothing is inferred from x_profiles or trials;
--   * checkout_orders / payments accept one more product id ('X_ACCOUNT_SLOT'); checkout_orders.plan
--     becomes nullable for that product only (the constraint below still requires the right plan for
--     every Premium product, so existing rows and Premium orders are validated exactly as before);
--   * create_checkout_order / billing_apply are replaced with the SAME signatures (privileges kept).
--     The only behaviour changes: slot orders are fulfilled by inserting one account_slot_grants row,
--     and a full refund / chargeback of a slot payment revokes that grant. Premium paths are unchanged.
-- No existing row in any table is read-modified, deleted or re-keyed. x_profiles, trials, subscriptions,
-- payments and gifts are untouched.
--
-- Rules enforced HERE (not only in the app):
--   * one ACTIVE binding per normalized username across ALL accounts (partial unique index);
--   * capacity: active bindings <= 2 + active purchased slots, checked under a per-user lock;
--   * bindings can only be created by register_x_account() / support_change_x_account(); they can never
--     be edited, and only an audited support release (or deletion of the whole account) ends one;
--   * slots are granted only by billing_apply() for a verified, successful payment of a slot order.

-- ===================================================================== bindings
create table public.x_account_bindings (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles (id) on delete cascade,
  username             text not null check (username ~ '^[A-Za-z0-9_]{1,15}$'),         -- as entered, without '@'
  normalized_username  text not null check (normalized_username ~ '^[a-z0-9_]{1,15}$'),
  status               text not null default 'active' check (status in ('active', 'released')),
  linked_by            text not null default 'self',                                   -- 'self' or 'support:<who>'
  confirmed_at         timestamptz not null default now(),                             -- the user's explicit confirmation
  created_at           timestamptz not null default now(),
  released_at          timestamptz,
  released_by          text,
  release_reason       text,
  constraint x_account_bindings_normalized check (normalized_username = lower(username)),
  constraint x_account_bindings_release_complete check (
    (status = 'active' and released_at is null and released_by is null and release_reason is null)
    or (status = 'released' and released_at is not null and released_by is not null and release_reason is not null)
  )
);
-- GLOBAL uniqueness: a username can be actively linked to only one GrowX account (case-insensitive, '@'-free).
create unique index x_account_bindings_active_username_key on public.x_account_bindings (normalized_username) where status = 'active';
create index x_account_bindings_user_idx on public.x_account_bindings (user_id, created_at) where status = 'active';

-- Append-only audit trail. No foreign keys, so history survives releases and account deletion.
create table public.x_account_binding_events (
  id                   bigint generated always as identity primary key,
  user_id              uuid not null,
  binding_id           uuid not null,
  action               text not null check (action in ('linked', 'released', 'account_deleted')),
  username             text not null,
  normalized_username  text not null,
  actor                text not null,          -- 'self' | 'support:<who>' | 'system'
  reason               text,
  related_binding_id   uuid,                   -- replace: the binding this one replaced
  created_at           timestamptz not null default now()
);
create index x_account_binding_events_user_idx on public.x_account_binding_events (user_id, created_at desc);

-- ======================================================================= slots
create table public.account_slot_grants (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  order_id        uuid not null references public.checkout_orders (id) on delete restrict,
  payment_id      uuid not null references public.payments (id) on delete restrict,
  slots           integer not null default 1 check (slots = 1),
  status          text not null default 'active' check (status in ('active', 'revoked')),
  revoked_at      timestamptz,
  revoked_reason  text check (revoked_reason in ('refund', 'chargeback')),
  created_at      timestamptz not null default now(),
  constraint account_slot_grants_order_key unique (order_id),
  constraint account_slot_grants_payment_key unique (payment_id),
  constraint account_slot_grants_revoked check ((status = 'active') = (revoked_at is null))
);
create index account_slot_grants_user_idx on public.account_slot_grants (user_id) where status = 'active';

-- =================================================================== privileges
-- Users may READ their own rows. Nobody writes through the API: not anon, not authenticated, not even
-- service_role (only the SECURITY DEFINER functions below write). Supabase's default privileges grant
-- everything to the API roles on new tables, hence the explicit revokes.
alter table public.x_account_bindings enable row level security;
alter table public.x_account_binding_events enable row level security;
alter table public.account_slot_grants enable row level security;
revoke all on public.x_account_bindings, public.x_account_binding_events, public.account_slot_grants from anon, authenticated, service_role;
grant select on public.x_account_bindings, public.x_account_binding_events, public.account_slot_grants to authenticated, service_role;
create policy x_account_bindings_select_own on public.x_account_bindings
  for select to authenticated using (user_id = (select auth.uid()));
create policy x_account_binding_events_select_own on public.x_account_binding_events
  for select to authenticated using (user_id = (select auth.uid()));
create policy account_slot_grants_select_own on public.account_slot_grants
  for select to authenticated using (user_id = (select auth.uid()));

-- ============================================================ immutability guards
-- Defence in depth on top of the privileges: even a role that CAN write the table cannot create, edit or
-- delete a binding except through the functions below (which set a transaction-local flag).
create or replace function public.x_account_bindings_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mode text := coalesce(current_setting('growx.x_binding_write', true), '');
begin
  if tg_op = 'INSERT' then
    if v_mode not in ('register', 'support') or new.status <> 'active' then
      raise exception 'x_account_binding_write_denied' using errcode = '42501';
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    -- Only an authorized support release, and only active -> released. Usernames are never edited in place.
    if v_mode <> 'support' or old.status <> 'active' or new.status <> 'released'
       or new.id <> old.id or new.user_id <> old.user_id or new.username <> old.username
       or new.normalized_username <> old.normalized_username or new.linked_by <> old.linked_by
       or new.created_at <> old.created_at or new.confirmed_at <> old.confirmed_at then
      raise exception 'x_account_binding_immutable' using errcode = '42501';
    end if;
    return new;
  else
    -- DELETE: only the cascade from deleting the whole account (its profile is already gone by then).
    if exists (select 1 from public.profiles where id = old.user_id) then
      raise exception 'x_account_binding_immutable' using errcode = '42501';
    end if;
    insert into public.x_account_binding_events (user_id, binding_id, action, username, normalized_username, actor, reason)
    values (old.user_id, old.id, 'account_deleted', old.username, old.normalized_username, 'system', 'account deleted');
    return old;
  end if;
end;
$$;
create trigger x_account_bindings_guard
  before insert or update or delete on public.x_account_bindings
  for each row execute function public.x_account_bindings_guard();

create or replace function public.x_account_binding_events_append_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'x_account_binding_events_append_only' using errcode = '42501';
end;
$$;
create trigger x_account_binding_events_append_only
  before update or delete on public.x_account_binding_events
  for each row execute function public.x_account_binding_events_append_only();

-- ==================================================================== helpers
-- '@Name ' -> 'Name'; anything that is not a valid X username -> null. The normalized form is lower(result).
create or replace function public.x_username_display(p_username text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case when v ~ '^[A-Za-z0-9_]{1,15}$' then v end
    from (select regexp_replace(btrim(coalesce(p_username, ''), E' \t\r\n'), '^@', '') as v) s;
$$;

create or replace function public.x_account_base_slots()
returns integer
language sql
immutable
set search_path = ''
as $$ select 2 $$;

-- allowed = 2 + successfully purchased (and not refunded / charged back) extra slots. Server-side only.
create or replace function public.x_account_allowed_slots(p_user uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select public.x_account_base_slots()
       + coalesce((select sum(slots)::integer from public.account_slot_grants where user_id = p_user and status = 'active'), 0);
$$;

-- ================================================================== register
-- Permanently links an X username to p_user. The caller MUST have obtained the user's explicit
-- confirmation (the API requires `confirm: true`). Serialised per user, so concurrent requests can never
-- exceed capacity; the global unique index makes concurrent requests from different accounts for the same
-- username link it at most once.
-- Returns {status: 'linked' | 'already_linked' | 'taken' | 'no_slot' | 'invalid_username' | 'no_account', ...}.
-- 'taken' carries no information about the other account.
create or replace function public.register_x_account(p_user uuid, p_username text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display text := public.x_username_display(p_username);
  v_norm text;
  v_used integer;
  v_allowed integer;
  v_id uuid;
begin
  if v_display is null then return jsonb_build_object('status', 'invalid_username'); end if;
  v_norm := lower(v_display);
  if p_user is null or not exists (select 1 from public.profiles where id = p_user) then
    return jsonb_build_object('status', 'no_account');
  end if;

  perform pg_advisory_xact_lock(hashtextextended('growx.x_accounts:' || p_user::text, 0));

  if exists (select 1 from public.x_account_bindings where user_id = p_user and normalized_username = v_norm and status = 'active') then
    return jsonb_build_object('status', 'already_linked', 'normalized_username', v_norm);
  end if;
  if exists (select 1 from public.x_account_bindings where normalized_username = v_norm and status = 'active') then
    return jsonb_build_object('status', 'taken');
  end if;

  select count(*) into v_used from public.x_account_bindings where user_id = p_user and status = 'active';
  v_allowed := public.x_account_allowed_slots(p_user);
  if v_used >= v_allowed then
    return jsonb_build_object('status', 'no_slot', 'used', v_used, 'allowed', v_allowed);
  end if;

  perform set_config('growx.x_binding_write', 'register', true);
  begin
    insert into public.x_account_bindings (user_id, username, normalized_username, linked_by)
    values (p_user, v_display, v_norm, 'self')
    returning id into v_id;
  exception when unique_violation then
    -- another account linked it a moment ago (it committed while we waited on the index)
    perform set_config('growx.x_binding_write', '', true);
    return jsonb_build_object('status', 'taken');
  end;
  perform set_config('growx.x_binding_write', '', true);

  insert into public.x_account_binding_events (user_id, binding_id, action, username, normalized_username, actor)
  values (p_user, v_id, 'linked', v_display, v_norm, 'self');

  return jsonb_build_object('status', 'linked', 'binding_id', v_id, 'username', v_display, 'normalized_username', v_norm,
                            'used', v_used + 1, 'allowed', v_allowed);
end;
$$;

-- ============================================================ support workflow
-- The ONLY way to correct or unlink a binding. Not executable by any API role (anon, authenticated,
-- service_role): run it from the Supabase SQL Editor as a project member. Every change is audited with
-- the actor and a reason; a replacement obeys global uniqueness and is atomic (on any failure nothing
-- changes). Repeating an operation changes nothing ('not_active').
--   select public.support_change_x_account('<binding id>', 'release', 'support:alice', 'User request #123: account sold');
--   select public.support_change_x_account('<binding id>', 'replace', 'support:alice', 'Typo fix, ticket #124', 'correct_name');
create or replace function public.support_change_x_account(
  p_binding_id uuid, p_action text, p_actor text, p_reason text, p_new_username text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_b public.x_account_bindings;
  v_display text;
  v_norm text;
  v_new uuid;
  v_actor text := btrim(coalesce(p_actor, ''));
  v_reason text := btrim(coalesce(p_reason, ''));
begin
  if p_action not in ('release', 'replace') then raise exception 'invalid_action'; end if;
  if v_actor !~ '^support:\S{2,}' then raise exception 'actor_required: use support:<name>'; end if;
  if length(v_reason) < 10 then raise exception 'reason_required: at least 10 characters'; end if;

  select user_id into v_user from public.x_account_bindings where id = p_binding_id;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  perform pg_advisory_xact_lock(hashtextextended('growx.x_accounts:' || v_user::text, 0));
  select * into v_b from public.x_account_bindings where id = p_binding_id for update;
  if v_b.status <> 'active' then return jsonb_build_object('status', 'not_active'); end if;

  if p_action = 'replace' then
    v_display := public.x_username_display(p_new_username);
    if v_display is null then return jsonb_build_object('status', 'invalid_username'); end if;
    v_norm := lower(v_display);
    if v_norm = v_b.normalized_username then return jsonb_build_object('status', 'unchanged'); end if;
    if exists (select 1 from public.x_account_bindings where normalized_username = v_norm and status = 'active') then
      return jsonb_build_object('status', 'taken');
    end if;
  end if;

  perform set_config('growx.x_binding_write', 'support', true);
  update public.x_account_bindings
     set status = 'released', released_at = now(), released_by = v_actor, release_reason = v_reason
   where id = v_b.id;
  insert into public.x_account_binding_events (user_id, binding_id, action, username, normalized_username, actor, reason)
  values (v_b.user_id, v_b.id, 'released', v_b.username, v_b.normalized_username, v_actor, v_reason);

  if p_action = 'replace' then
    -- a concurrent link of the same name raises unique_violation here and rolls back the release too
    insert into public.x_account_bindings (user_id, username, normalized_username, linked_by)
    values (v_b.user_id, v_display, v_norm, v_actor)
    returning id into v_new;
    insert into public.x_account_binding_events (user_id, binding_id, action, username, normalized_username, actor, reason, related_binding_id)
    values (v_b.user_id, v_new, 'linked', v_display, v_norm, v_actor, v_reason, v_b.id);
  end if;
  perform set_config('growx.x_binding_write', '', true);

  return jsonb_build_object('status', case when p_action = 'replace' then 'replaced' else 'released' end,
                            'released_binding_id', v_b.id, 'new_binding_id', v_new);
end;
$$;

-- ================================================================ slot product
alter table public.checkout_orders drop constraint checkout_orders_product_check;
alter table public.checkout_orders add constraint checkout_orders_product_check
  check (product in ('PRO_MONTHLY', 'PRO_YEARLY', 'PRO_LIFETIME', 'PRO_LIFETIME_EARLY', 'X_ACCOUNT_SLOT'));
-- plan stays restricted to the three Premium plans (checkout_orders_plan_check, unchanged); null only for add-ons.
alter table public.checkout_orders alter column plan drop not null;
alter table public.checkout_orders drop constraint checkout_orders_plan_matches_product;
alter table public.checkout_orders add constraint checkout_orders_plan_matches_product check (
  case product
    when 'PRO_MONTHLY' then plan is not distinct from 'PRO_MONTHLY'
    when 'PRO_YEARLY' then plan is not distinct from 'PRO_YEARLY'
    when 'PRO_LIFETIME' then plan is not distinct from 'PRO_LIFETIME'
    when 'PRO_LIFETIME_EARLY' then plan is not distinct from 'PRO_LIFETIME'
    when 'X_ACCOUNT_SLOT' then plan is null and provider = 'nowpayments' and period_days is null
    else false
  end
);

alter table public.payments drop constraint payments_product_check;
alter table public.payments add constraint payments_product_check
  check (product in ('PRO_MONTHLY', 'PRO_YEARLY', 'PRO_LIFETIME', 'PRO_LIFETIME_EARLY', 'X_ACCOUNT_SLOT'));

-- ------------------------------------------------------------ order creation
-- Same as 20261010050903_billing_core, plus: the lifetime "already_owned" guard applies to Premium
-- products only (a lifetime owner can still buy account slots), and at most 3 unpaid slot orders may be open.
create or replace function public.create_checkout_order(
  p_user_id uuid, p_provider text, p_product text, p_plan text,
  p_amount_minor bigint, p_currency text, p_asset text, p_period_days integer, p_ttl_seconds integer
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_slots int;
  v_open int;
begin
  -- Serialise with the early-adopter allocator and other order creations.
  perform pg_advisory_xact_lock(hashtextextended('growx.early_adopter', 0));

  if p_plan is not null and exists (select 1 from public.subscriptions
              where user_id = p_user_id and plan = 'PRO_LIFETIME' and status = 'active' and access_revoked_at is null) then
    return jsonb_build_object('status', 'error', 'code', 'already_owned');
  end if;

  if p_provider = 'paddle' and p_plan in ('PRO_MONTHLY', 'PRO_YEARLY') and exists (
       select 1 from public.subscriptions
        where user_id = p_user_id and provider = 'paddle' and plan in ('PRO_MONTHLY', 'PRO_YEARLY')
          and status in ('active', 'past_due') and access_revoked_at is null) then
    return jsonb_build_object('status', 'error', 'code', 'already_subscribed');
  end if;

  if p_product = 'X_ACCOUNT_SLOT' and (
       select count(*) from public.checkout_orders
        where user_id = p_user_id and product = 'X_ACCOUNT_SLOT' and status in ('created', 'pending')
          and (reservation_expires_at is null or reservation_expires_at > now())) >= 3 then
    return jsonb_build_object('status', 'error', 'code', 'too_many_open_orders');
  end if;

  if p_product = 'PRO_LIFETIME_EARLY' then
    update public.checkout_orders set status = 'expired'
     where product = 'PRO_LIFETIME_EARLY' and status in ('created', 'pending')
       and reservation_expires_at is not null and reservation_expires_at <= now();
    if exists (select 1 from public.checkout_orders
                where user_id = p_user_id and product = 'PRO_LIFETIME_EARLY'
                  and status in ('created', 'pending', 'fulfilled', 'refund_required')) then
      return jsonb_build_object('status', 'error', 'code', 'early_already_held');
    end if;
    select count(*) into v_slots from public.early_adopter_slots;
    if v_slots >= 100 then
      return jsonb_build_object('status', 'error', 'code', 'early_sold_out');
    end if;
    select count(*) into v_open from public.checkout_orders
     where product = 'PRO_LIFETIME_EARLY' and status in ('created', 'pending')
       and reservation_expires_at is not null and reservation_expires_at > now();
    if v_slots + v_open >= 100 then
      return jsonb_build_object('status', 'error', 'code', 'early_unavailable');
    end if;
  end if;

  insert into public.checkout_orders (user_id, provider, product, plan, expected_amount_minor, currency, asset, period_days, reservation_expires_at)
  values (p_user_id, p_provider, p_product, p_plan, p_amount_minor, upper(p_currency), p_asset, p_period_days,
          now() + make_interval(secs => p_ttl_seconds))
  returning id into v_id;
  return jsonb_build_object('status', 'ok', 'order_id', v_id);
end;
$$;

-- ------------------------------------------------------------ billing_apply
-- Same as 20261010050903_billing_core, plus three changes (marked by account_slot_grants / plan is null):
--   1. fulfilment of an X_ACCOUNT_SLOT order inserts ONE account_slot_grants row (idempotent);
--   2. a full refund or a chargeback of that payment revokes the grant;
--   3. subscription_sync never treats an add-on order (plan is null) as a subscription.
create or replace function public.billing_apply(
  p_provider text, p_event_id text, p_event_type text, p_occurred_at timestamptz, p_effect jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_evt_id bigint;
  v_done timestamptz;
  v_kind text := p_effect->>'kind';
  v_result text := 'applied';
  v_order public.checkout_orders;
  v_order_id uuid;
  v_user uuid;
  v_pay public.payments;
  v_pay_id uuid;
  v_status text;
  v_sub public.subscriptions;
  v_sub_ref text;
  v_slot smallint;
  v_slots int;
  v_open int;
  v_ok boolean;
  v_new_status text;
  v_amount bigint;
  v_adj_id bigint;
begin
  if p_provider not in ('paddle', 'nowpayments') then raise exception 'invalid_provider'; end if;

  -- ---- idempotency: one row per (provider, event id), locked for the duration
  insert into public.webhook_events (provider, event_id, event_type, occurred_at)
  values (p_provider, p_event_id, p_event_type, p_occurred_at)
  on conflict (provider, event_id) do nothing
  returning id into v_evt_id;
  if v_evt_id is null then
    select id, processed_at into v_evt_id, v_done from public.webhook_events
     where provider = p_provider and event_id = p_event_id for update;
    if v_done is not null then
      return jsonb_build_object('result', 'duplicate');
    end if;
  end if;

  -- Same lock as the early-adopter allocator: inventory decisions never interleave.
  perform pg_advisory_xact_lock(hashtextextended('growx.early_adopter', 0));

  begin
    v_order_id := nullif(p_effect->>'order_id', '')::uuid;
  exception when others then
    v_order_id := null;
  end;

  if v_kind = 'noop' then
    v_result := 'ignored';

  -- ================================================================ payment
  elsif v_kind = 'payment' then
    v_status := p_effect->>'status';
    v_sub_ref := nullif(p_effect->>'subscription_ref', '');

    if v_order_id is not null then
      select * into v_order from public.checkout_orders where id = v_order_id for update;
      if not found then v_order_id := null; end if;
    end if;

    if v_order_id is not null then
      v_user := v_order.user_id;
      if v_order.provider <> p_provider then
        v_result := 'rejected:order_provider_mismatch';
      elsif v_order.provider_ref is not null and v_order.provider_ref <> p_effect->>'provider_payment_id'
            and not (p_provider = 'paddle' and v_sub_ref is not null) then
        v_result := 'rejected:order_reference_mismatch';
      end if;
    elsif v_sub_ref is not null then
      select user_id into v_user from public.subscriptions
       where provider = p_provider and provider_subscription_id = v_sub_ref;
    end if;

    if v_user is null and v_result = 'applied' then
      v_result := 'unlinked';
    end if;

    -- Amount / asset / plan validation against what the SERVER put in the order.
    if v_result = 'applied' and v_order_id is not null then
      if p_provider = 'paddle' then
        v_ok := (p_effect->>'price_product') is not null and (p_effect->>'price_product') = v_order.product
                and upper(coalesce(p_effect->>'currency', '')) = v_order.currency;
      else
        v_ok := (p_effect->>'amount_minor')::bigint = v_order.expected_amount_minor
                and upper(coalesce(p_effect->>'currency', '')) = v_order.currency
                and lower(coalesce(p_effect->>'asset', '')) = lower(coalesce(v_order.asset, ''))
                and (p_effect->>'product') = v_order.product;
      end if;
      if not v_ok then
        v_result := 'rejected:order_validation_failed';
        -- Money may have moved for something that does not match the order: never grant, flag for manual refund review.
        if v_status in ('succeeded', 'confirming', 'partially_paid') and v_order.status not in ('fulfilled') then
          update public.checkout_orders set status = 'refund_required' where id = v_order.id;
        end if;
      end if;
    end if;

    if v_result = 'applied' then
      v_amount := coalesce((p_effect->>'amount_minor')::bigint, 0);
      insert into public.payments (user_id, provider, provider_payment_id, product, amount_minor, currency, status,
                                   order_id, provider_status, asset, asset_expected, asset_received)
      values (v_user, p_provider, p_effect->>'provider_payment_id', p_effect->>'product', v_amount,
              upper(p_effect->>'currency'), v_status, v_order_id, p_effect->>'provider_status',
              p_effect->>'asset', p_effect->>'asset_expected', p_effect->>'asset_received')
      on conflict (provider, provider_payment_id) do update set
        status = case
          when public.payments.status in ('refunded', 'disputed') then public.payments.status
          when public.payments.status = 'succeeded' and excluded.status <> 'succeeded' then public.payments.status
          else excluded.status end,
        provider_status = excluded.provider_status,
        asset_received = coalesce(excluded.asset_received, public.payments.asset_received),
        order_id = coalesce(public.payments.order_id, excluded.order_id)
      returning id into v_pay_id;

      select * into v_pay from public.payments where id = v_pay_id;
      if v_pay.user_id <> v_user then
        raise exception 'payment_user_mismatch';   -- never reassign a payment to another user
      end if;

      -- ------- fulfillment: only a verified, successful payment on a matching order
      if coalesce((p_effect->>'fulfill')::boolean, false) and v_pay.status = 'succeeded' and v_order_id is not null then
        if v_order.status = 'fulfilled' then
          v_result := 'duplicate_fulfillment';
        elsif v_order.status = 'refund_required' then
          v_result := 'rejected:refund_required';
        else
          if v_order.product = 'PRO_LIFETIME_EARLY' then
            -- Expired reservations may only fulfil if inventory remains AFTER honouring open reservations.
            select count(*) into v_slots from public.early_adopter_slots;
            select count(*) into v_open from public.checkout_orders
             where product = 'PRO_LIFETIME_EARLY' and status in ('created', 'pending') and id <> v_order.id
               and reservation_expires_at is not null and reservation_expires_at > now();
            v_slot := null;
            if v_order.reservation_expires_at is null or v_order.reservation_expires_at > now()
               or v_slots + v_open < 100 then
              v_slot := public.claim_early_adopter_slot(v_pay.id);
            end if;
            if v_slot is null then
              update public.checkout_orders set status = 'refund_required' where id = v_order.id;
              v_result := 'refund_required:early_adopter_unavailable';
            end if;
          end if;

          if v_result = 'applied' then
            if v_order.product = 'X_ACCOUNT_SLOT' then
              -- One extra X account slot per verified, successful slot order. Unique per order AND per payment,
              -- so duplicate or replayed notifications can never grant twice.
              insert into public.account_slot_grants (user_id, order_id, payment_id)
              values (v_user, v_order.id, v_pay.id)
              on conflict do nothing;
              update public.checkout_orders set status = 'fulfilled', fulfilled_at = now() where id = v_order.id;
            elsif v_order.plan = 'PRO_LIFETIME' then
              insert into public.subscriptions (user_id, provider, plan, status, current_period_end, source_payment_id,
                                                provider_customer_id, provider_updated_at)
              values (v_user, p_provider, 'PRO_LIFETIME', 'active', null, v_pay.id,
                      nullif(p_effect->>'customer_ref', ''), p_occurred_at)
              on conflict (source_payment_id) where source_payment_id is not null do nothing;
              update public.checkout_orders set status = 'fulfilled', fulfilled_at = now() where id = v_order.id;
            elsif p_provider = 'nowpayments' then
              if public.grant_crypto_period(v_user, v_order.plan, coalesce(v_order.period_days, 30), v_pay.id) then
                update public.checkout_orders set status = 'fulfilled', fulfilled_at = now() where id = v_order.id;
              else
                update public.checkout_orders set status = 'refund_required' where id = v_order.id;
                v_result := 'refund_required:chargeback_block';
              end if;
            end if;
            -- Paddle recurring access is granted by the subscription events, not here.
          end if;
        end if;
      end if;

      -- ------- conclusive non-completion releases the reservation
      if p_effect->>'order_status' in ('expired', 'failed', 'canceled') and v_order_id is not null
         and v_pay.status <> 'succeeded' then
        update public.checkout_orders set status = p_effect->>'order_status'
         where id = v_order_id and status in ('created', 'pending');
      end if;
    end if;

  -- ======================================================= subscription_sync
  elsif v_kind = 'subscription_sync' then
    v_sub_ref := p_effect->>'provider_subscription_id';
    v_status := p_effect->>'status';
    select * into v_sub from public.subscriptions
     where provider = p_provider and provider_subscription_id = v_sub_ref for update;

    if not found then
      if v_order_id is not null then
        select * into v_order from public.checkout_orders where id = v_order_id for update;
      end if;
      if v_order_id is null or not found then
        v_result := 'unlinked';
      elsif v_order.provider <> p_provider or v_order.plan is null or v_order.plan <> p_effect->>'plan'
            or v_order.plan not in ('PRO_MONTHLY', 'PRO_YEARLY') then
        v_result := 'rejected:order_validation_failed';
      elsif v_status not in ('active') then
        v_result := 'ignored';   -- never create access from a non-active first state
      elsif (p_effect->>'period_end') is null then
        v_result := 'rejected:missing_period_end';
      else
        insert into public.subscriptions (user_id, provider, provider_customer_id, provider_subscription_id, plan, status,
                                          current_period_end, cancel_at_period_end, provider_updated_at)
        values (v_order.user_id, p_provider, nullif(p_effect->>'customer_ref', ''), v_sub_ref, v_order.plan, 'active',
                (p_effect->>'period_end')::timestamptz, coalesce((p_effect->>'cancel_at_period_end')::boolean, false), p_occurred_at)
        on conflict (provider, provider_subscription_id) where provider_subscription_id is not null do nothing;
        update public.checkout_orders set status = 'fulfilled', fulfilled_at = now() where id = v_order.id and status <> 'fulfilled';
      end if;
    else
      if v_sub.provider_updated_at is not null and p_occurred_at is not null and p_occurred_at <= v_sub.provider_updated_at then
        v_result := 'stale';     -- older than what we already applied
      elsif v_status = 'trialing' then
        v_result := 'ignored';
      else
        v_new_status := case v_status
          when 'active' then 'active'
          when 'past_due' then 'past_due'
          when 'canceled' then 'canceled'
          when 'paused' then 'canceled'
          else null end;
        if v_new_status is null then
          v_result := 'ignored';
        elsif v_sub.access_revoked_at is not null then
          -- Refund/chargeback revoked this subscription: keep it revoked; only track the timestamp.
          update public.subscriptions set provider_updated_at = p_occurred_at where id = v_sub.id;
          v_result := 'revoked_unchanged';
        else
          update public.subscriptions set
            status = v_new_status,
            current_period_end = coalesce((p_effect->>'period_end')::timestamptz, current_period_end),
            cancel_at_period_end = coalesce((p_effect->>'cancel_at_period_end')::boolean, cancel_at_period_end),
            past_due_since = case when v_new_status = 'past_due' then coalesce(past_due_since, p_occurred_at, now()) else null end,
            provider_customer_id = coalesce(nullif(p_effect->>'customer_ref', ''), provider_customer_id),
            provider_updated_at = p_occurred_at
          where id = v_sub.id;
        end if;
      end if;
    end if;

  -- ============================================================== adjustment
  elsif v_kind = 'adjustment' then
    select * into v_pay from public.payments
     where provider = p_provider and provider_payment_id = p_effect->>'provider_payment_id' for update;
    if not found then
      v_result := 'unlinked';
    elsif p_effect->>'status' <> 'approved' or p_effect->>'action' not in ('refund', 'chargeback') then
      v_result := 'ignored';     -- pending/rejected/reversed adjustments, credits and warnings change nothing
    else
      v_amount := coalesce((p_effect->>'amount_minor')::bigint, 0);
      -- apply each provider adjustment exactly once, whatever events announce it
      insert into public.payment_adjustments (provider, adjustment_id, payment_id, action, amount_minor)
      values (p_provider, coalesce(nullif(p_effect->>'adjustment_id', ''), p_event_id), v_pay.id, p_effect->>'action', v_amount)
      on conflict (provider, adjustment_id) do nothing
      returning id into v_adj_id;
      if v_adj_id is null then
        v_result := 'duplicate_adjustment';
      elsif p_effect->>'action' = 'chargeback' then
        update public.payments set status = 'disputed', refunded_minor = least(amount_minor, refunded_minor + v_amount)
         where id = v_pay.id;
        update public.subscriptions set access_revoked_at = now(), revoked_reason = 'chargeback',
               status = case when status in ('active', 'past_due') then 'canceled' else status end
         where source_payment_id = v_pay.id
            or (nullif(p_effect->>'subscription_ref', '') is not null and provider = p_provider
                and provider_subscription_id = p_effect->>'subscription_ref');
        update public.account_slot_grants set status = 'revoked', revoked_at = now(), revoked_reason = 'chargeback'
         where payment_id = v_pay.id and status = 'active';
      else
        update public.payments set refunded_minor = least(amount_minor, refunded_minor + v_amount),
               status = case when (p_effect->>'adj_type') = 'full' or refunded_minor + v_amount >= amount_minor
                             then 'refunded' else status end
         where id = v_pay.id returning * into v_pay;
        if v_pay.status = 'refunded' then
          update public.subscriptions set access_revoked_at = coalesce(access_revoked_at, now()),
                 revoked_reason = coalesce(revoked_reason, 'refund'),
                 status = case when status in ('active', 'past_due') then 'refunded' else status end
           where source_payment_id = v_pay.id
              or (nullif(p_effect->>'subscription_ref', '') is not null and provider = p_provider
                  and provider_subscription_id = p_effect->>'subscription_ref');
          update public.account_slot_grants set status = 'revoked', revoked_at = now(), revoked_reason = 'refund'
           where payment_id = v_pay.id and status = 'active';
        end if;
      end if;
    end if;
  else
    raise exception 'unknown_effect_kind';
  end if;

  update public.webhook_events set processed_at = now(), result = v_result, order_id = v_order_id where id = v_evt_id;
  return jsonb_build_object('result', v_result);
end;
$$;

-- =================================================================== privileges
revoke all on function public.x_account_bindings_guard() from public, anon, authenticated, service_role;
revoke all on function public.x_account_binding_events_append_only() from public, anon, authenticated, service_role;
revoke all on function public.x_username_display(text) from public, anon, authenticated;
revoke all on function public.x_account_base_slots() from public, anon, authenticated;
revoke all on function public.x_account_allowed_slots(uuid) from public, anon, authenticated;
revoke all on function public.register_x_account(uuid, text) from public, anon, authenticated;
-- support corrections: no API role at all (SQL Editor / database owner only)
revoke all on function public.support_change_x_account(uuid, text, text, text, text) from public, anon, authenticated, service_role;
grant execute on function public.x_username_display(text) to service_role;
grant execute on function public.x_account_base_slots() to service_role;
grant execute on function public.x_account_allowed_slots(uuid) to service_role;
grant execute on function public.register_x_account(uuid, text) to service_role;
