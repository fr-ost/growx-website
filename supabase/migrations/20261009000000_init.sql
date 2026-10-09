-- GrowX initial schema: profiles, x_profiles, trials, subscriptions, payments,
-- plus webhook_events (idempotency ledger for future Paddle / NOWPayments).
--
-- Security model:
--   * RLS is enabled on every table.
--   * Signed-in users may only READ their own rows, plus write their own
--     x_profiles row. Everything else (trials, subscriptions, payments,
--     webhook_events) is written ONLY by the service role (server code or,
--     later, verified webhook handlers). No client can grant itself a plan.
--   * anon gets no table privileges at all.


-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

-- Create the profile automatically when an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the copied email in sync if the auth email changes.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- -------------------------------------------------------------- x_profiles
-- A SELF-REPORTED X username. It is NOT proof of ownership and must never be
-- used to authorise anything. It exists to label the account and to reduce
-- (not eliminate) repeated trial abuse. Deliberately NOT unique across users,
-- so nobody can block someone else by claiming their handle.
create table public.x_profiles (
  user_id              uuid primary key references public.profiles (id) on delete cascade,
  x_username           text not null,
  x_username_normalized text generated always as (lower(x_username)) stored,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint x_username_format check (x_username ~ '^[A-Za-z0-9_]{1,15}$')
);
create index x_profiles_normalized_idx on public.x_profiles (x_username_normalized);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger x_profiles_touch
  before update on public.x_profiles
  for each row execute function public.touch_updated_at();

-- Username change history (never deleted by a rename).
create table public.x_profile_history (
  id                    bigint generated always as identity primary key,
  user_id               uuid not null references public.profiles (id) on delete cascade,
  x_username            text not null,
  x_username_normalized text not null,
  recorded_at           timestamptz not null default now()
);
create index x_profile_history_user_idx on public.x_profile_history (user_id, recorded_at desc);

create or replace function public.record_x_username()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.x_profile_history (user_id, x_username, x_username_normalized)
  values (new.user_id, new.x_username, lower(new.x_username));
  return new;
end;
$$;

create trigger x_profiles_history
  after insert or update of x_username on public.x_profiles
  for each row execute function public.record_x_username();

-- ------------------------------------------------------------------ trials
-- One row per trial ever granted; rows are never deleted on rename. The X
-- username is snapshotted at start so a later rename cannot erase history or
-- be used to start a second trial.
create table public.trials (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles (id) on delete cascade,
  x_username_normalized  text not null,
  started_at             timestamptz not null default now(),
  expires_at             timestamptz not null,
  status                 text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  created_at             timestamptz not null default now(),
  constraint trials_expiry_after_start check (expires_at > started_at),
  -- At most one trial per account, ever.
  constraint trials_user_id_key unique (user_id),
  -- At most one trial per (self-reported) X username, ever. Best-effort only.
  constraint trials_x_username_key unique (x_username_normalized)
);

-- Starts a trial atomically. Callable ONLY by the service role (the server).
-- Time comes from the database clock, never from the client.
create or replace function public.start_trial(p_user_id uuid, p_days integer default 14)
returns public.trials
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_norm text;
  v_row  public.trials;
begin
  if p_days is null or p_days < 1 or p_days > 60 then
    raise exception 'invalid_trial_days' using errcode = 'P0001';
  end if;

  select x_username_normalized into v_norm
    from public.x_profiles where user_id = p_user_id;
  if v_norm is null then
    raise exception 'x_username_required' using errcode = 'P0001';
  end if;

  -- Unique constraints raise 23505 on a repeat call; callers map that to
  -- "trial already used".
  insert into public.trials (user_id, x_username_normalized, started_at, expires_at, status)
  values (p_user_id, v_norm, now(), now() + make_interval(days => p_days), 'active')
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.start_trial(uuid, integer) from public, anon, authenticated;
grant execute on function public.start_trial(uuid, integer) to service_role;

-- ----------------------------------------------------------- subscriptions
-- Provider-neutral. Recurring plans carry a provider subscription id and a
-- billing period end. Lifetime has no period end and (for one-time purchases)
-- no provider subscription id; it points at the payment that created it.
create table public.subscriptions (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references public.profiles (id) on delete cascade,
  provider                  text not null check (provider in ('paddle', 'nowpayments')),
  provider_customer_id      text,
  provider_subscription_id  text,
  plan                      text not null check (plan in ('PRO_MONTHLY', 'PRO_YEARLY', 'PRO_LIFETIME')),
  status                    text not null check (status in ('active', 'past_due', 'canceled', 'expired', 'refunded')),
  current_period_end        timestamptz,
  cancel_at_period_end      boolean not null default false,
  source_payment_id         uuid,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  -- Recurring plans must have a period end; lifetime must not.
  constraint subscriptions_period_matches_plan check (
    (plan = 'PRO_LIFETIME' and current_period_end is null)
    or (plan <> 'PRO_LIFETIME' and current_period_end is not null)
  )
);
create index subscriptions_user_idx on public.subscriptions (user_id);
create unique index subscriptions_provider_sub_key
  on public.subscriptions (provider, provider_subscription_id)
  where provider_subscription_id is not null;

create trigger subscriptions_touch
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- payments
create table public.payments (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles (id) on delete restrict,
  provider             text not null check (provider in ('paddle', 'nowpayments')),
  provider_payment_id  text not null,
  -- What was bought. Lets the early-adopter cap be counted from verified,
  -- successful payments only.
  product              text not null check (product in ('PRO_MONTHLY', 'PRO_YEARLY', 'PRO_LIFETIME', 'PRO_LIFETIME_EARLY')),
  amount_minor         bigint not null check (amount_minor >= 0),   -- minor units (cents)
  currency             text not null check (currency ~ '^[A-Z0-9]{3,10}$'),
  status               text not null check (status in ('pending', 'succeeded', 'failed', 'refunded', 'disputed')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint payments_provider_payment_key unique (provider, provider_payment_id)
);
create index payments_user_idx on public.payments (user_id, created_at desc);
create index payments_early_adopter_idx on public.payments (product, status) where product = 'PRO_LIFETIME_EARLY';

create trigger payments_touch
  before update on public.payments
  for each row execute function public.touch_updated_at();

alter table public.subscriptions
  add constraint subscriptions_source_payment_fk
  foreign key (source_payment_id) references public.payments (id) on delete set null;

-- ----------------------------------------------------------- webhook_events
-- Idempotency ledger for future verified webhooks: insert (provider, event_id)
-- first; a unique violation means "already processed". Service role only.
create table public.webhook_events (
  id           bigint generated always as identity primary key,
  provider     text not null check (provider in ('paddle', 'nowpayments')),
  event_id     text not null,
  event_type   text not null,
  received_at  timestamptz not null default now(),
  processed_at timestamptz,
  constraint webhook_events_provider_event_key unique (provider, event_id)
);

-- ------------------------------------------------------------------- RLS
alter table public.profiles           enable row level security;
alter table public.x_profiles         enable row level security;
alter table public.x_profile_history  enable row level security;
alter table public.trials             enable row level security;
alter table public.subscriptions      enable row level security;
alter table public.payments           enable row level security;
alter table public.webhook_events     enable row level security;

-- Start from zero privileges, then grant the minimum.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select on public.profiles, public.x_profile_history, public.trials, public.subscriptions, public.payments
  to authenticated;
grant select, insert on public.x_profiles to authenticated;
grant update (x_username) on public.x_profiles to authenticated;

create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy x_profiles_select_own on public.x_profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy x_profiles_insert_own on public.x_profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy x_profiles_update_own on public.x_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy x_profile_history_select_own on public.x_profile_history
  for select to authenticated using (user_id = (select auth.uid()));

create policy trials_select_own on public.trials
  for select to authenticated using (user_id = (select auth.uid()));

create policy subscriptions_select_own on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));

create policy payments_select_own on public.payments
  for select to authenticated using (user_id = (select auth.uid()));

-- webhook_events: RLS on, no policies => no access for anon/authenticated.
-- The service role bypasses RLS.
