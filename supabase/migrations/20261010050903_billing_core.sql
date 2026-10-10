-- Phase 3: unified billing core for Paddle (cards) and NOWPayments (crypto).
-- Additive and non-destructive: new tables/columns/functions, one widened CHECK.
-- No existing rows are modified. RLS stays enabled; every new function is
-- executable by service_role only.
--
-- Design:
--   * checkout_orders: one row per purchase attempt, created ONLY by the server
--     for a verified session user. The server-chosen plan/amount/asset live here;
--     provider payloads are validated against them before anything is granted.
--   * billing_apply(): the single entry point for provider events. It records
--     the event (idempotency), validates it against the order, and applies
--     payments / subscriptions / refunds in ONE transaction. A thrown error
--     rolls everything back (including the idempotency row) so the provider
--     retries; deliberate rejections are recorded and acknowledged.
--   * Early-adopter inventory: slots (permanent, PK 1..100) + short-lived
--     reservations on open orders, all guarded by one advisory lock.

-- ------------------------------------------------------------ payments
alter table public.payments drop constraint payments_status_check;
alter table public.payments add constraint payments_status_check
  check (status in ('pending', 'confirming', 'partially_paid', 'succeeded', 'failed', 'expired', 'refunded', 'disputed'));

alter table public.payments
  add column provider_status text,           -- raw provider status, for audit
  add column order_id uuid,                  -- FK added after checkout_orders exists
  add column refunded_minor bigint not null default 0 check (refunded_minor >= 0),
  add column asset text,                     -- crypto: pay currency code
  add column asset_expected text,            -- crypto: amount we asked for (decimal string)
  add column asset_received text;            -- crypto: amount actually received

-- ------------------------------------------------------ subscriptions
alter table public.subscriptions
  add column provider_updated_at timestamptz,  -- newest provider event applied (out-of-order guard)
  add column access_revoked_at timestamptz,    -- refund/chargeback: Premium denied regardless of status
  add column revoked_reason text check (revoked_reason in ('refund', 'chargeback'));

-- One subscription row per payment that created it (no duplicate grants).
create unique index subscriptions_source_payment_key
  on public.subscriptions (source_payment_id) where source_payment_id is not null;
-- Prepaid crypto periods extend ONE row per (user, plan).
create unique index subscriptions_crypto_user_plan_key
  on public.subscriptions (user_id, plan) where provider = 'nowpayments';

-- --------------------------------------------------------- checkout_orders
create table public.checkout_orders (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles (id) on delete restrict,
  provider                text not null check (provider in ('paddle', 'nowpayments')),
  product                 text not null check (product in ('PRO_MONTHLY', 'PRO_YEARLY', 'PRO_LIFETIME', 'PRO_LIFETIME_EARLY')),
  plan                    text not null check (plan in ('PRO_MONTHLY', 'PRO_YEARLY', 'PRO_LIFETIME')),
  expected_amount_minor   bigint not null check (expected_amount_minor > 0),
  currency                text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  asset                   text,                     -- crypto pay currency code (server allowlist)
  period_days             integer check (period_days is null or period_days between 1 and 400), -- crypto prepaid period
  provider_ref            text,                     -- Paddle transaction id / NOWPayments payment id
  status                  text not null default 'created'
                          check (status in ('created', 'pending', 'fulfilled', 'expired', 'failed', 'canceled', 'refund_required')),
  reservation_expires_at  timestamptz,              -- early-adopter reservation / crypto payment window
  fulfilled_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint checkout_orders_early_is_lifetime check (product <> 'PRO_LIFETIME_EARLY' or plan = 'PRO_LIFETIME'),
  constraint checkout_orders_plan_matches_product check (
    (product = 'PRO_MONTHLY' and plan = 'PRO_MONTHLY') or (product = 'PRO_YEARLY' and plan = 'PRO_YEARLY')
    or (product in ('PRO_LIFETIME', 'PRO_LIFETIME_EARLY') and plan = 'PRO_LIFETIME')
  )
);
create unique index checkout_orders_provider_ref_key on public.checkout_orders (provider, provider_ref) where provider_ref is not null;
create index checkout_orders_user_idx on public.checkout_orders (user_id, created_at desc);
-- A user can hold at most one live (open or paid) early-adopter order.
create unique index checkout_orders_one_early_per_user on public.checkout_orders (user_id)
  where product = 'PRO_LIFETIME_EARLY' and status in ('created', 'pending', 'fulfilled', 'refund_required');
create index checkout_orders_early_open_idx on public.checkout_orders (reservation_expires_at)
  where product = 'PRO_LIFETIME_EARLY' and status in ('created', 'pending');

create trigger checkout_orders_touch
  before update on public.checkout_orders
  for each row execute function public.touch_updated_at();

alter table public.payments
  add constraint payments_order_fk foreign key (order_id) references public.checkout_orders (id) on delete set null;
create index payments_order_idx on public.payments (order_id) where order_id is not null;

alter table public.checkout_orders enable row level security;
revoke all on public.checkout_orders from anon, authenticated;
grant select on public.checkout_orders to authenticated;
create policy checkout_orders_select_own on public.checkout_orders
  for select to authenticated using (user_id = (select auth.uid()));
grant select, insert, update on public.checkout_orders to service_role;

-- ----------------------------------------------------------- webhook_events
alter table public.webhook_events
  add column occurred_at timestamptz,   -- provider's event time
  add column result text,               -- applied | duplicate | stale | rejected:<why> | unlinked | ignored
  add column order_id uuid;
revoke all on public.webhook_events from anon, authenticated;
grant select, insert, update on public.webhook_events to service_role;

-- ------------------------------------------------------ payment_adjustments
-- Refunds / chargebacks are applied once per PROVIDER ADJUSTMENT id, not per event:
-- a provider may announce the same approved adjustment in several events.
create table public.payment_adjustments (
  id              bigint generated always as identity primary key,
  provider        text not null check (provider in ('paddle', 'nowpayments')),
  adjustment_id   text not null,
  payment_id      uuid not null references public.payments (id) on delete cascade,
  action          text not null check (action in ('refund', 'chargeback')),
  amount_minor    bigint not null check (amount_minor >= 0),
  created_at      timestamptz not null default now(),
  constraint payment_adjustments_provider_adj_key unique (provider, adjustment_id)
);
create index payment_adjustments_payment_idx on public.payment_adjustments (payment_id);
alter table public.payment_adjustments enable row level security;
revoke all on public.payment_adjustments from anon, authenticated;
grant select, insert on public.payment_adjustments to service_role;
grant usage, select on all sequences in schema public to service_role;

-- --------------------------------------------------- early adopter inventory
-- Slots (permanent purchases) + open, unexpired reservations are compared
-- against 100. Only booleans / a coarse state are exposed, never counts.
create or replace function public.early_adopter_available()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select count(*) from public.early_adopter_slots)
       + (select count(*) from public.checkout_orders
            where product = 'PRO_LIFETIME_EARLY' and status in ('created', 'pending')
              and reservation_expires_at is not null and reservation_expires_at > now()) < 100;
$$;

-- 'sold_out' (permanent), 'unavailable' (all remaining slots temporarily reserved), 'available'
create or replace function public.early_adopter_state()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when (select count(*) from public.early_adopter_slots) >= 100 then 'sold_out'
    when public.early_adopter_available() then 'available'
    else 'unavailable'
  end;
$$;

-- ------------------------------------------------------------ order creation
-- Atomically validates and creates an order. Returns jsonb:
--   {status:'ok', order_id}  |  {status:'error', code}
-- codes: already_owned, already_subscribed, early_unavailable, early_sold_out, early_already_held
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

  if exists (select 1 from public.subscriptions
              where user_id = p_user_id and plan = 'PRO_LIFETIME' and status = 'active' and access_revoked_at is null) then
    return jsonb_build_object('status', 'error', 'code', 'already_owned');
  end if;

  if p_provider = 'paddle' and p_plan in ('PRO_MONTHLY', 'PRO_YEARLY') and exists (
       select 1 from public.subscriptions
        where user_id = p_user_id and provider = 'paddle' and plan in ('PRO_MONTHLY', 'PRO_YEARLY')
          and status in ('active', 'past_due') and access_revoked_at is null) then
    return jsonb_build_object('status', 'error', 'code', 'already_subscribed');
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

-- Records the provider object (transaction / payment id) for an order.
create or replace function public.attach_order_ref(p_order_id uuid, p_ref text, p_expires_at timestamptz)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.checkout_orders
     set provider_ref = p_ref, status = 'pending',
         reservation_expires_at = coalesce(p_expires_at, reservation_expires_at)
   where id = p_order_id and status = 'created';
$$;

-- Closes an order that conclusively did not complete (provider creation failed,
-- user abandoned, payment expired/failed). Never touches fulfilled orders.
create or replace function public.close_checkout_order(p_order_id uuid, p_status text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.checkout_orders set status = p_status
   where id = p_order_id and status in ('created', 'pending') and p_status in ('expired', 'failed', 'canceled');
$$;

-- --------------------------------------------------- crypto prepaid periods
create or replace function public.grant_crypto_period(p_user_id uuid, p_plan text, p_days integer, p_payment_id uuid)
returns boolean   -- false when access is blocked by a chargeback
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sub public.subscriptions;
  v_base timestamptz;
begin
  select * into v_sub from public.subscriptions
   where user_id = p_user_id and provider = 'nowpayments' and plan = p_plan for update;
  if found then
    if v_sub.revoked_reason = 'chargeback' then return false; end if;
    -- A refunded-and-repurchased subscription restarts from now; otherwise stack on remaining time.
    v_base := case when v_sub.access_revoked_at is not null or v_sub.status <> 'active'
                   then now() else greatest(coalesce(v_sub.current_period_end, now()), now()) end;
    update public.subscriptions
       set status = 'active', current_period_end = v_base + make_interval(days => p_days),
           source_payment_id = p_payment_id, past_due_since = null, cancel_at_period_end = false,
           access_revoked_at = null, revoked_reason = null
     where id = v_sub.id;
  else
    insert into public.subscriptions (user_id, provider, plan, status, current_period_end, source_payment_id)
    values (p_user_id, 'nowpayments', p_plan, 'active', now() + make_interval(days => p_days), p_payment_id);
  end if;
  return true;
end;
$$;

-- ------------------------------------------------------------ billing_apply
-- p_effect (jsonb) kinds:
--   payment:           provider_payment_id, status (pending|confirming|partially_paid|succeeded|failed|expired),
--                      fulfill (bool), order_id?, subscription_ref?, product, plan, amount_minor, currency,
--                      price_product? (Paddle: product mapped from the transaction's price ids by the server), asset?, asset_expected?, asset_received?,
--                      provider_status, order_status? (expired|failed|canceled), customer_ref?
--   subscription_sync: provider_subscription_id, order_id?, plan, status (active|trialing|past_due|canceled|paused),
--                      period_end?, cancel_at_period_end, customer_ref?
--   adjustment:        provider_payment_id, adjustment_id, action, adj_type (full|partial), status, amount_minor
--   noop:              record the event only
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
            if v_order.plan = 'PRO_LIFETIME' then
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
      elsif v_order.provider <> p_provider or v_order.plan <> p_effect->>'plan'
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

-- --------------------------------------------------------------- privileges
-- Functions default to PUBLIC execute: lock every billing function to service_role.
revoke all on function public.early_adopter_available() from public, anon, authenticated;
revoke all on function public.early_adopter_state() from public, anon, authenticated;
revoke all on function public.create_checkout_order(uuid, text, text, text, bigint, text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.attach_order_ref(uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.close_checkout_order(uuid, text) from public, anon, authenticated;
revoke all on function public.grant_crypto_period(uuid, text, integer, uuid) from public, anon, authenticated;
revoke all on function public.billing_apply(text, text, text, timestamptz, jsonb) from public, anon, authenticated;
grant execute on function public.early_adopter_available() to service_role;
grant execute on function public.early_adopter_state() to service_role;
grant execute on function public.create_checkout_order(uuid, text, text, text, bigint, text, text, integer, integer) to service_role;
grant execute on function public.attach_order_ref(uuid, text, timestamptz) to service_role;
grant execute on function public.close_checkout_order(uuid, text) to service_role;
grant execute on function public.grant_crypto_period(uuid, text, integer, uuid) to service_role;
grant execute on function public.billing_apply(text, text, text, timestamptz, jsonb) to service_role;
