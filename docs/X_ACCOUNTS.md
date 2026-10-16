# X accounts: permanent bindings, slots and the $0.99 slot add-on

Migration: `supabase/migrations/20261016100712_x_account_bindings.sql`: **applied to production on 2026-10-16** (owner-approved). Verified afterwards: RLS on all three tables, API roles read-only, global unique index and guard triggers present, the support function not executable by any API role, 0 bindings created, existing orders/payments/subscriptions/trials unchanged, no new security advisor findings.

It also relies on `20261014000100_active_sessions.sql` (single active login), applied by the owner in the SQL Editor on 2026-10-16 and verified afterwards (table with RLS and no API-role access, four service-role-only functions, no existing sessions changed). Because it was run in the SQL Editor, it does not appear in Supabase's migration history; that is cosmetic.

## Rules
* Every GrowX account can link **2** X usernames for free. Each extra username needs one extra slot: **$0.99, one-time** (`X_ACCOUNT_SLOT`).
* `allowed slots = 2 + purchased slots that are paid and not refunded or charged back`. Only the database computes it (`public.x_account_allowed_slots`). No client value (body, local storage, return URL, frontend payment state) can change it.
* A username is linked only after the user **explicitly confirms** (dashboard: review step + "I understand" checkbox; API: `confirm: true` is mandatory).
* Linked usernames are **permanent**. Users cannot change or remove them (the API answers `405` to PUT/PATCH/DELETE; the database refuses edits). Corrections go through support (below).
* **Global uniqueness:** a username can be linked to only **one** GrowX account. Case and a leading `@` do not matter (`@MyName`, `myname` and `MYNAME` are the same). The error is always `This X username is already linked to another GrowX account.`, and it reveals nothing about the other account.
* Linking or buying slots never creates, resets or edits trials, subscriptions, payments or `x_profiles`. The migration links nothing by itself: existing `x_profiles` / trial usernames are **not** converted into bindings. (For older accounts the dashboard pre-fills the old trial username in the input; the user must still confirm it.)
* A binding lists usernames GrowX may be used with. It does **not** prove which X account is signed in on x.com and does not verify ownership. GrowX never asks for X credentials.

## Architecture
| Piece | Where |
|---|---|
| `x_account_bindings` (one row per link; `status active/released`) | migration. **Partial unique index on `normalized_username` where `status = 'active'`** enforces global uniqueness for every path (UI, extension, support, direct SQL) |
| `x_account_binding_events` (append-only audit: linked / released / account_deleted, actor, reason) | migration; triggers refuse UPDATE/DELETE |
| `account_slot_grants` (one row per paid slot order; unique per order and per payment) | migration; written only by `billing_apply` |
| `register_x_account(user, username)` | service role only. Normalises, validates, takes a per-user advisory lock (concurrent requests cannot exceed capacity), checks capacity, inserts; a concurrent link of the same name by another account fails on the unique index and returns `taken` |
| `support_change_x_account(binding, 'release'/'replace', 'support:<name>', reason, new_username)` | **no API role can execute it** (not anon, authenticated or service_role): only a project member in the Supabase SQL Editor |
| Guard trigger | even a role with table privileges cannot insert/edit/delete bindings outside the two functions; a binding row disappears only when the whole account is deleted (audited) |
| RLS | users can SELECT only their own bindings, events and grants; nobody can write through the API |
| `GET/POST /api/x-accounts` | `src/app/api/x-accounts/route.ts` (cookie or extension Bearer, active-session check, CORS allowlist) |
| `POST /api/x-accounts/slots/checkout` | `src/app/api/x-accounts/slots/checkout/route.ts` -> `src/lib/billing/invoice.ts` (shared with Premium checkout) |
| Entitlement fields | `src/app/api/entitlement/route.ts` (contract in [`API.md`](API.md)) |
| Dashboard "X accounts" section (the old editable username form was removed; `/account` redirects to `/dashboard`) | `src/app/dashboard/page.tsx`, `src/components/x-accounts-manager.tsx` |
| Free trial | uses the first linked X account (`src/app/dashboard/actions.ts`) |

## Slot purchases (NOWPayments)
1. `POST /api/x-accounts/slots/checkout {}` (logged in, verified email, same origin). The body must be empty.
2. `create_checkout_order` creates an order `product = 'X_ACCOUNT_SLOT'`, `plan = null`, $0.99, for the **session user** (max 3 unpaid slot orders open at once).
3. A NOWPayments hosted invoice is created for the server's price; the browser goes to the invoice page.
4. The IPN (`/api/webhooks/nowpayments`) is verified exactly like Premium payments: HMAC-SHA512 signature, re-fetch from the NOWPayments API, order binding, then `billing_apply` checks amount (99 cents), currency (USD), coin, payment reference and product against the order.
5. Only `finished` with the full amount fulfils: one `account_slot_grants` row (unique per order and per payment, so duplicate or replayed IPNs never grant twice). `waiting/confirming/partially_paid/failed/expired` grant nothing; `failed/expired` close the order. Wrong amount/currency/coin/product -> `refund_required`, nothing granted.
6. A full refund or a chargeback revokes the grant. Already linked usernames are **not** unlinked (that would be a silent unlink); the account just cannot link more until it has a free slot again (`availableAccountSlots` stays 0).
7. The return page `/checkout/{order}` only displays the server's state. Visiting it never grants anything.

### Is $0.99 payable?
**Not verified.** NOWPayments enforces a minimum payment per coin (you saw $11 for USDT TRC20). Invoice creation for $0.99 should succeed, but on the invoice page **any coin whose minimum is above $0.99 will refuse the payment**. ETH (mainnet) minimums are usually several dollars; BNB Smart Chain / BEP20 coins are usually lower, but this could not be checked from the build environment (outbound access to NOWPayments is blocked here). **The price was not changed.**

Check it yourself with your API key (read-only; per coin you have enabled):
```bash
curl -s -H "x-api-key: $NOWPAYMENTS_API_KEY" \
  "https://api.nowpayments.io/v1/min-amount?currency_from=bnbbsc&currency_to=bnbbsc&fiat_equivalent=usd"
# repeat for each enabled coin, e.g. usdtbsc, usdcbsc, eth
```
If `fiat_equivalent` is above 0.99 for **every** coin you accept, slot purchases cannot complete. Options (your decision): enable a low-minimum coin, change the slot price, or sell slots in bundles. Do not lower verification to work around it.

## Support workflow (authorized, audited)
Run in Supabase -> SQL Editor (project members only). Always give your name and a reason (ticket number).
```sql
-- find the binding
select id, user_id, username, status, created_at from public.x_account_bindings where normalized_username = lower('TheName');
-- unlink (frees the username for anyone)
select public.support_change_x_account('<binding id>', 'release', 'support:shahriar', 'Ticket 123: user sold this X account');
-- correct a typo (atomic: release + new link for the same user; fails if the new name is linked anywhere)
select public.support_change_x_account('<binding id>', 'replace', 'support:shahriar', 'Ticket 124: spelling fix', 'Correct_Name');
-- audit trail
select * from public.x_account_binding_events where user_id = '<user id>' order by id;
```
Results: `released`, `replaced`, `not_active` (already done: nothing changed), `taken`, `invalid_username`, `unchanged`, `not_found`. Verify the requester owns the GrowX account (reply from the account email) before changing anything.

There is deliberately **no web admin endpoint**: the site has no admin role, and a leaked service-role key still cannot run support changes.

## Existing data review
Production (read-only check, 2026-10-16): 15 `x_profiles`, **0 duplicate normalized usernames**, 14 trials. Bindings are a new, empty table, so there are no binding duplicates to resolve and nothing is linked automatically. If duplicates ever appear in `x_profiles` (trial usernames are self-reported and editable), nothing in this feature depends on them; resolve them by asking each owner, never by unlinking or editing records silently.

Two username concepts now exist: the editable **trial username** (`x_profiles`, used once to start a trial) and the **permanent linked usernames** (`x_account_bindings`). Unifying them (for example, making the trial require a linked username) is an owner decision and is not part of this change.

## Not covered / limits
* No rate limiting on `POST /api/x-accounts` (anyone signed in can test whether a name is linked somewhere; the answer reveals no account details). Use Vercel Firewall rules.
* Concurrency was tested on a local PostgreSQL 16 server and PGlite, not on the production database.
* No real $0.99 payment has been made.
