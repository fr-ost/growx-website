-- Phase 2 (billing groundwork; no payment processing is implemented):
--   * past_due_since: when a recurring payment first failed, so a configurable
--     grace period can be applied by the entitlement resolver.
--   * early_adopter_slots: atomic, server-side allocation of the first 100
--     verified $0.99 lifetime purchases.

alter table public.subscriptions
  add column past_due_since timestamptz,
  add constraint subscriptions_past_due_requires_since
    check (status <> 'past_due' or past_due_since is not null);

-- One row per sold slot. The primary key (1..100) makes overselling
-- structurally impossible, even if two transactions race.
create table public.early_adopter_slots (
  slot        smallint primary key check (slot between 1 and 100),
  payment_id  uuid not null unique references public.payments (id) on delete restrict,
  claimed_at  timestamptz not null default now()
);
alter table public.early_adopter_slots enable row level security;
revoke all on public.early_adopter_slots from anon, authenticated;

-- Claims a slot for a VERIFIED, SUCCEEDED early-adopter payment.
--   returns the slot number (1..100); idempotent for the same payment;
--   returns NULL when sold out or the payment is not an eligible success.
-- Failed, canceled, abandoned or pending payments never get a slot.
-- A slot, once claimed, is NOT released by a later refund (policy: see docs/PAYMENTS.md).
create or replace function public.claim_early_adopter_slot(p_payment_id uuid)
returns smallint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slot smallint;
  v_ok   boolean;
begin
  -- Serialise all claims so the "next free slot" computation cannot race.
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

  select s into v_slot
    from generate_series(1, 100) as s
   where not exists (select 1 from public.early_adopter_slots e where e.slot = s)
   order by s
   limit 1;
  if v_slot is null then
    return null; -- sold out
  end if;

  insert into public.early_adopter_slots (slot, payment_id) values (v_slot, p_payment_id);
  return v_slot;
end;
$$;

-- True while at least one slot is free. Deliberately returns a boolean, never a
-- count: the site must not display a remaining-slot number.
create or replace function public.early_adopter_available()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select count(*) from public.early_adopter_slots) < 100;
$$;

revoke all on function public.claim_early_adopter_slot(uuid) from public, anon, authenticated;
revoke all on function public.early_adopter_available() from public, anon, authenticated;
grant execute on function public.claim_early_adopter_slot(uuid) to service_role;
grant execute on function public.early_adopter_available() to service_role;
grant select, insert on public.early_adopter_slots to service_role;
