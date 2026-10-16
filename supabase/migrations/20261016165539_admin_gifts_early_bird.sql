-- Admin dashboard: Premium gifts + Lifetime Early Bird editor.
--
-- Additive and non-destructive. No existing row is modified except:
--   * the CHECK on early_adopter_slots.slot is widened from 1..100 to 1..1000 (existing rows still valid);
--   * one settings row is inserted (enabled, sales cap 100, campaign allocation 100), which reproduces today's
--     behaviour exactly: successful early-bird sales already recorded in early_adopter_slots keep counting.
-- create_checkout_order / billing_apply / early-adopter functions are replaced with the SAME signatures; the only
-- change is that the hard-coded 100 is read from early_bird_settings and the offer can be disabled.
-- Users, subscriptions, payments, trials, X account bindings and slot grants are untouched.
--
-- Admin model: a user is an administrator only if their auth user id is in public.admins. That table can only be
-- changed by a project member in the Supabase SQL Editor (no API role can write it). Every admin function below
-- re-checks it, so a server bug cannot let a non-admin act. Admin functions are executable by service_role only
-- (the website server), never by browser roles.

-- ======================================================================= admins
create table public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  note        text,
  created_at  timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated, service_role;
grant select on public.admins to service_role;

create or replace function public._is_admin(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select p_user is not null and exists (select 1 from public.admins where user_id = p_user) $$;

-- ================================================================ premium gifts
-- A gift is a complimentary entitlement. It is NOT a payment or a subscription: nothing is written to payments,
-- checkout_orders or subscriptions, so revoking or expiring a gift can never touch paid access.
create table public.premium_gifts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  granted_by     uuid not null,                                 -- admin user id (no FK: history survives)
  duration       text not null check (duration in ('7d', '30d', '90d', '1y', 'lifetime')),
  starts_at      timestamptz not null default now(),
  expires_at     timestamptz,                                   -- null = lifetime
  status         text not null default 'active' check (status in ('active', 'revoked')),
  reason         text check (reason is null or length(reason) <= 500),
  revoked_at     timestamptz,
  revoked_by     uuid,
  revoke_reason  text check (revoke_reason is null or length(revoke_reason) <= 500),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint premium_gifts_lifetime check ((duration = 'lifetime') = (expires_at is null)),
  constraint premium_gifts_revoked check ((status = 'revoked') = (revoked_at is not null and revoked_by is not null))
);
create index premium_gifts_user_idx on public.premium_gifts (user_id, created_at desc);
create index premium_gifts_created_idx on public.premium_gifts (created_at desc);

create table public.premium_gift_events (
  id               bigint generated always as identity primary key,
  gift_id          uuid not null,
  user_id          uuid not null,
  admin_id         uuid not null,
  action           text not null check (action in ('grant', 'extend', 'revoke')),
  duration         text,
  prev_expires_at  timestamptz,
  new_expires_at   timestamptz,
  reason           text,
  created_at       timestamptz not null default now()
);
create index premium_gift_events_gift_idx on public.premium_gift_events (gift_id, id);

alter table public.premium_gifts enable row level security;
alter table public.premium_gift_events enable row level security;
revoke all on public.premium_gifts, public.premium_gift_events from anon, authenticated, service_role;
grant select on public.premium_gifts, public.premium_gift_events to service_role;
-- Recipients may read their OWN gifts, but not the internal reason or the administrator.
grant select (id, user_id, duration, starts_at, expires_at, status, revoked_at, created_at) on public.premium_gifts to authenticated;
create policy premium_gifts_select_own on public.premium_gifts
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.premium_gift_events_append_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_log_append_only' using errcode = '42501';
end;
$$;
create trigger premium_gift_events_append_only
  before update or delete on public.premium_gift_events
  for each row execute function public.premium_gift_events_append_only();

create or replace function public._gift_interval(p_duration text)
returns interval
language sql
immutable
set search_path = ''
as $$
  select case p_duration
    when '7d' then interval '7 days'
    when '30d' then interval '30 days'
    when '90d' then interval '90 days'
    when '1y' then interval '1 year'
  end;
$$;

-- Exact (case-insensitive) email lookup. Admin only.
create or replace function public.admin_find_user(p_admin uuid, p_email text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_row record;
begin
  if not public._is_admin(p_admin) then raise exception 'not_admin' using errcode = '42501'; end if;
  select p.id, p.email, p.created_at into v_row
    from public.profiles p
   where lower(p.email) = lower(btrim(coalesce(p_email, '')))
   limit 1;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  return jsonb_build_object('status', 'ok', 'user_id', v_row.id, 'email', v_row.email, 'created_at', v_row.created_at);
end;
$$;

-- Grants Premium now. Expiry is computed here (server time). One running gift per user: extend it instead.
create or replace function public.admin_grant_gift(p_admin uuid, p_user uuid, p_duration text, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_exp timestamptz;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if not public._is_admin(p_admin) then raise exception 'not_admin' using errcode = '42501'; end if;
  if p_duration not in ('7d', '30d', '90d', '1y', 'lifetime') then return jsonb_build_object('status', 'invalid_duration'); end if;
  if not exists (select 1 from public.profiles where id = p_user) then return jsonb_build_object('status', 'user_not_found'); end if;
  perform pg_advisory_xact_lock(hashtextextended('growx.gift:' || p_user::text, 0));
  if exists (select 1 from public.premium_gifts where user_id = p_user and status = 'active' and (expires_at is null or expires_at > now())) then
    return jsonb_build_object('status', 'active_gift_exists');
  end if;
  v_exp := case when p_duration = 'lifetime' then null else now() + public._gift_interval(p_duration) end;
  insert into public.premium_gifts (user_id, granted_by, duration, starts_at, expires_at, reason)
  values (p_user, p_admin, p_duration, now(), v_exp, v_reason)
  returning id into v_id;
  insert into public.premium_gift_events (gift_id, user_id, admin_id, action, duration, prev_expires_at, new_expires_at, reason)
  values (v_id, p_user, p_admin, 'grant', p_duration, null, v_exp, v_reason);
  return jsonb_build_object('status', 'granted', 'gift_id', v_id, 'expires_at', v_exp);
end;
$$;

-- Adds time from the later of now and the current expiry (an expired gift restarts from now). 'lifetime' makes it permanent.
create or replace function public.admin_extend_gift(p_admin uuid, p_gift uuid, p_duration text, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_g public.premium_gifts;
  v_exp timestamptz;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if not public._is_admin(p_admin) then raise exception 'not_admin' using errcode = '42501'; end if;
  if p_duration not in ('7d', '30d', '90d', '1y', 'lifetime') then return jsonb_build_object('status', 'invalid_duration'); end if;
  select * into v_g from public.premium_gifts where id = p_gift;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  perform pg_advisory_xact_lock(hashtextextended('growx.gift:' || v_g.user_id::text, 0));
  select * into v_g from public.premium_gifts where id = p_gift for update;
  if v_g.status <> 'active' then return jsonb_build_object('status', 'revoked'); end if;
  if v_g.expires_at is null then return jsonb_build_object('status', 'already_lifetime'); end if;
  if exists (select 1 from public.premium_gifts where user_id = v_g.user_id and id <> v_g.id and status = 'active' and (expires_at is null or expires_at > now())) then
    return jsonb_build_object('status', 'other_gift_active');
  end if;
  v_exp := case when p_duration = 'lifetime' then null else greatest(v_g.expires_at, now()) + public._gift_interval(p_duration) end;
  update public.premium_gifts
     set expires_at = v_exp, duration = case when p_duration = 'lifetime' then 'lifetime' else duration end, updated_at = now()
   where id = v_g.id;
  insert into public.premium_gift_events (gift_id, user_id, admin_id, action, duration, prev_expires_at, new_expires_at, reason)
  values (v_g.id, v_g.user_id, p_admin, 'extend', p_duration, v_g.expires_at, v_exp, v_reason);
  return jsonb_build_object('status', 'extended', 'expires_at', v_exp);
end;
$$;

-- Ends a gift immediately. Touches ONLY the gift: paid subscriptions, trials and payments are separate records.
create or replace function public.admin_revoke_gift(p_admin uuid, p_gift uuid, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_g public.premium_gifts;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if not public._is_admin(p_admin) then raise exception 'not_admin' using errcode = '42501'; end if;
  select * into v_g from public.premium_gifts where id = p_gift;
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  perform pg_advisory_xact_lock(hashtextextended('growx.gift:' || v_g.user_id::text, 0));
  select * into v_g from public.premium_gifts where id = p_gift for update;
  if v_g.status = 'revoked' then return jsonb_build_object('status', 'already_revoked'); end if;
  update public.premium_gifts
     set status = 'revoked', revoked_at = now(), revoked_by = p_admin, revoke_reason = v_reason, updated_at = now()
   where id = v_g.id;
  insert into public.premium_gift_events (gift_id, user_id, admin_id, action, duration, prev_expires_at, new_expires_at, reason)
  values (v_g.id, v_g.user_id, p_admin, 'revoke', v_g.duration, v_g.expires_at, v_g.expires_at, v_reason);
  return jsonb_build_object('status', 'revoked');
end;
$$;

-- ============================================================ early bird settings
-- One row. remaining = max(0, sales_cap - successful sales); campaign_allocation is the hard ceiling (100 for the
-- initial campaign). Successful sales are the rows of early_adopter_slots (never reset by an edit).
create table public.early_bird_settings (
  id                   smallint primary key default 1 check (id = 1),
  enabled              boolean not null default true,
  sales_cap            integer not null check (sales_cap >= 0),
  campaign_allocation  integer not null check (campaign_allocation between 1 and 1000),
  updated_at           timestamptz not null default now(),
  updated_by           uuid,
  constraint early_bird_settings_cap_within_allocation check (sales_cap <= campaign_allocation)
);
insert into public.early_bird_settings (id, enabled, sales_cap, campaign_allocation) values (1, true, 100, 100);
alter table public.early_bird_settings enable row level security;
revoke all on public.early_bird_settings from anon, authenticated, service_role;
grant select on public.early_bird_settings to service_role;

create table public.early_bird_events (
  id                bigint generated always as identity primary key,
  admin_id          uuid not null,
  action            text not null check (action in ('set_inventory', 'increase_allocation')),
  sold_at_change    integer not null,
  prev_enabled      boolean,
  new_enabled       boolean,
  prev_remaining    integer,
  new_remaining     integer,
  prev_cap          integer,
  new_cap           integer,
  prev_allocation   integer,
  new_allocation    integer,
  reason            text,
  created_at        timestamptz not null default now()
);
alter table public.early_bird_events enable row level security;
revoke all on public.early_bird_events from anon, authenticated, service_role;
grant select on public.early_bird_events to service_role;
create trigger early_bird_events_append_only
  before update or delete on public.early_bird_events
  for each row execute function public.premium_gift_events_append_only();

-- Slot numbers may go up to the (possibly increased) campaign allocation.
alter table public.early_adopter_slots drop constraint early_adopter_slots_slot_check;
alter table public.early_adopter_slots add constraint early_adopter_slots_slot_check check (slot between 1 and 1000);

-- Same contract as before (idempotent per payment, only verified succeeded PRO_LIFETIME_EARLY payments), with the
-- ceiling taken from the campaign allocation. Whether a sale may still use a spot is decided by billing_apply.
create or replace function public.claim_early_adopter_slot(p_payment_id uuid)
returns smallint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slot smallint;
  v_ok   boolean;
  v_max  integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('growx.early_adopter', 0));

  select slot into v_slot from public.early_adopter_slots where payment_id = p_payment_id;
  if v_slot is not null then
    return v_slot; -- already claimed: idempotent
  end if;

  select true into v_ok
    from public.payments
   where id = p_payment_id and product = 'PRO_LIFETIME_EARLY' and status = 'succeeded';
  if v_ok is null then
    return null;
  end if;

  select campaign_allocation into v_max from public.early_bird_settings where id = 1;
  select s into v_slot
    from generate_series(1, coalesce(v_max, 100)) as s
   where not exists (select 1 from public.early_adopter_slots e where e.slot = s)
   order by s
   limit 1;
  if v_slot is null then
    return null; -- campaign allocation exhausted
  end if;

  insert into public.early_adopter_slots (slot, payment_id) values (v_slot, p_payment_id);
  return v_slot;
end;
$$;

create or replace function public.early_adopter_available()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select enabled from public.early_bird_settings where id = 1), false)
     and (select count(*) from public.early_adopter_slots)
       + (select count(*) from public.checkout_orders
            where product = 'PRO_LIFETIME_EARLY' and status in ('created', 'pending')
              and reservation_expires_at is not null and reservation_expires_at > now())
       < coalesce((select sales_cap from public.early_bird_settings where id = 1), 0);
$$;

-- 'off' (disabled by an admin), 'sold_out' (no remaining spots), 'available', 'unavailable' (all remaining spots reserved)
create or replace function public.early_adopter_state()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when not coalesce((select enabled from public.early_bird_settings where id = 1), false) then 'off'
    when (select count(*) from public.early_adopter_slots) >= coalesce((select sales_cap from public.early_bird_settings where id = 1), 0) then 'sold_out'
    when public.early_adopter_available() then 'available'
    else 'unavailable'
  end;
$$;

-- Everything the server needs to price and display the offer, in one consistent read.
create or replace function public.early_bird_status()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'state', public.early_adopter_state(),
    'enabled', s.enabled,
    'sold', sold.n,
    'open_reservations', open.n,
    'sales_cap', s.sales_cap,
    'campaign_allocation', s.campaign_allocation,
    'remaining', greatest(0, s.sales_cap - sold.n),
    'updated_at', s.updated_at)
  from public.early_bird_settings s,
       (select count(*)::integer as n from public.early_adopter_slots) sold,
       (select count(*)::integer as n from public.checkout_orders
          where product = 'PRO_LIFETIME_EARLY' and status in ('created', 'pending')
            and reservation_expires_at is not null and reservation_expires_at > now()) open
  where s.id = 1;
$$;

-- Admin: set the remaining spots (cap := sold + remaining) and/or enable/disable. Never touches sales, orders or
-- entitlements. p_expected_updated_at (optional) rejects an edit made against a stale view ('stale').
create or replace function public.admin_set_early_bird(
  p_admin uuid, p_remaining integer, p_enabled boolean, p_reason text default null, p_expected_updated_at timestamptz default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_s public.early_bird_settings;
  v_sold integer;
  v_new_cap integer;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if not public._is_admin(p_admin) then raise exception 'not_admin' using errcode = '42501'; end if;
  if p_remaining is null or p_remaining < 0 then return jsonb_build_object('status', 'invalid_remaining'); end if;
  if p_enabled is null then return jsonb_build_object('status', 'invalid_enabled'); end if;
  -- Same lock as checkout reservations and payment fulfilment: inventory decisions never interleave.
  perform pg_advisory_xact_lock(hashtextextended('growx.early_adopter', 0));
  select * into v_s from public.early_bird_settings where id = 1 for update;
  if p_expected_updated_at is not null and v_s.updated_at <> p_expected_updated_at then
    return jsonb_build_object('status', 'stale');
  end if;
  select count(*) into v_sold from public.early_adopter_slots;
  v_new_cap := v_sold + p_remaining;
  if v_new_cap > v_s.campaign_allocation then
    return jsonb_build_object('status', 'exceeds_allocation', 'max_remaining', greatest(0, v_s.campaign_allocation - v_sold));
  end if;
  update public.early_bird_settings
     set sales_cap = v_new_cap, enabled = p_enabled, updated_at = now(), updated_by = p_admin
   where id = 1;
  insert into public.early_bird_events (admin_id, action, sold_at_change, prev_enabled, new_enabled, prev_remaining, new_remaining,
                                        prev_cap, new_cap, prev_allocation, new_allocation, reason)
  values (p_admin, 'set_inventory', v_sold, v_s.enabled, p_enabled, greatest(0, v_s.sales_cap - v_sold), p_remaining,
          v_s.sales_cap, v_new_cap, v_s.campaign_allocation, v_s.campaign_allocation, v_reason);
  return jsonb_build_object('status', 'saved', 'remaining', p_remaining, 'enabled', p_enabled);
end;
$$;

-- Admin: exceptional, explicit increase of the campaign allocation (the 100 ceiling). A reason is mandatory.
-- It does not add remaining spots by itself; set the remaining count separately.
create or replace function public.admin_increase_early_bird_allocation(p_admin uuid, p_new_allocation integer, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_s public.early_bird_settings;
  v_sold integer;
  v_reason text := btrim(coalesce(p_reason, ''));
begin
  if not public._is_admin(p_admin) then raise exception 'not_admin' using errcode = '42501'; end if;
  if length(v_reason) < 10 then return jsonb_build_object('status', 'reason_required'); end if;
  perform pg_advisory_xact_lock(hashtextextended('growx.early_adopter', 0));
  select * into v_s from public.early_bird_settings where id = 1 for update;
  if p_new_allocation is null or p_new_allocation <= v_s.campaign_allocation or p_new_allocation > 1000 then
    return jsonb_build_object('status', 'invalid_allocation', 'current', v_s.campaign_allocation);
  end if;
  select count(*) into v_sold from public.early_adopter_slots;
  update public.early_bird_settings set campaign_allocation = p_new_allocation, updated_at = now(), updated_by = p_admin where id = 1;
  insert into public.early_bird_events (admin_id, action, sold_at_change, prev_enabled, new_enabled, prev_remaining, new_remaining,
                                        prev_cap, new_cap, prev_allocation, new_allocation, reason)
  values (p_admin, 'increase_allocation', v_sold, v_s.enabled, v_s.enabled, greatest(0, v_s.sales_cap - v_sold), greatest(0, v_s.sales_cap - v_sold),
          v_s.sales_cap, v_s.sales_cap, v_s.campaign_allocation, p_new_allocation, v_reason);
  return jsonb_build_object('status', 'saved', 'campaign_allocation', p_new_allocation);
end;
$$;

-- ------------------------------------------------------------ order creation
-- Same as 20261016100712_x_account_bindings, except the early-bird limit comes from early_bird_settings
-- (sales cap) and a disabled offer refuses discounted orders ('early_disabled').
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
  v_cap int;
  v_enabled boolean;
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
    select sales_cap, enabled into v_cap, v_enabled from public.early_bird_settings where id = 1;
    if not coalesce(v_enabled, false) then
      return jsonb_build_object('status', 'error', 'code', 'early_disabled');
    end if;
    select count(*) into v_slots from public.early_adopter_slots;
    if v_slots >= coalesce(v_cap, 0) then
      return jsonb_build_object('status', 'error', 'code', 'early_sold_out');
    end if;
    select count(*) into v_open from public.checkout_orders
     where product = 'PRO_LIFETIME_EARLY' and status in ('created', 'pending')
       and reservation_expires_at is not null and reservation_expires_at > now();
    if v_slots + v_open >= v_cap then
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
-- Same as 20261016100712_x_account_bindings, except the fulfilment rule for LATE early-bird payments uses the
-- settings (enabled + sales cap) instead of the hard-coded 100.
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
  v_cap int;
  v_enabled boolean;
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
            select sales_cap, enabled into v_cap, v_enabled from public.early_bird_settings where id = 1;
            v_slot := null;
            -- An unexpired reservation keeps the price and spot it was created with, even if an admin later lowered
            -- the remaining count or disabled the offer. A LATE payment (reservation expired) is honoured only while
            -- the offer is enabled and spots remain after other buyers' open reservations.
            if v_order.reservation_expires_at is null or v_order.reservation_expires_at > now()
               or (coalesce(v_enabled, false) and v_slots + v_open < coalesce(v_cap, 0)) then
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
revoke all on function public._is_admin(uuid) from public, anon, authenticated;
revoke all on function public._gift_interval(text) from public, anon, authenticated;
revoke all on function public.premium_gift_events_append_only() from public, anon, authenticated, service_role;
revoke all on function public.admin_find_user(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_grant_gift(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.admin_extend_gift(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.admin_revoke_gift(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.early_bird_status() from public, anon, authenticated;
revoke all on function public.admin_set_early_bird(uuid, integer, boolean, text, timestamptz) from public, anon, authenticated;
revoke all on function public.admin_increase_early_bird_allocation(uuid, integer, text) from public, anon, authenticated;
grant execute on function public._is_admin(uuid) to service_role;
grant execute on function public.admin_find_user(uuid, text) to service_role;
grant execute on function public.admin_grant_gift(uuid, uuid, text, text) to service_role;
grant execute on function public.admin_extend_gift(uuid, uuid, text, text) to service_role;
grant execute on function public.admin_revoke_gift(uuid, uuid, text) to service_role;
grant execute on function public.early_bird_status() to service_role;
grant execute on function public.admin_set_early_bird(uuid, integer, boolean, text, timestamptz) to service_role;
grant execute on function public.admin_increase_early_bird_allocation(uuid, integer, text) to service_role;
