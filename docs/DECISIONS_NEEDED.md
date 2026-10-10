# Decisions and business details

## Decided by the owner
- Legal name: **Shahriar Ahmed Tushar**; address: **Rajshahi, Bangladesh** (used in the privacy/terms drafts).
- Production domain: **https://www.growxapp.org** (default `site.url`; still set `NEXT_PUBLIC_SITE_URL` in Vercel).
- Chrome Web Store: https://chromewebstore.google.com/detail/ofiancichfcakbdgekhcahflpoglfgbh (extension ID `ofiancichfcakbdgekhcahflpoglfgbh`; origin `chrome-extension://ofiancichfcakbdgekhcahflpoglfgbh`; OAuth redirect `https://ofiancichfcakbdgekhcahflpoglfgbh.chromiumapp.org/`).
- Support email: support@growxapp.org (moved with the domain change from .net; make sure the mailbox exists). Grace period, early-adopter and provider decisions: see `PRODUCT_REQUIREMENTS.md`.
- Public people/credits: only **Shahriar Ahmed** appears on the site (contact, copyright, About, structured data). The legal drafts still use the full legal name "Shahriar Ahmed Tushar".
- Business model: **freemium with a 30-day trial**. Not 100% free any more; **no grandfathering**: all users get the same experience after the extension update.
- The trial **requires an X username** (abuse reduction) and a confirmed email.

## Still open
- [ ] Lawyer review of the now-published `/privacy`, `/terms`, `/refund-policy`. Defaults used: 14-day refunds, "lifetime" = while Premium is offered, Bangladesh law/Rajshahi courts, 12-month liability cap, 7-year payment-record retention. Change if you disagree.
- [ ] Confirm the Free/Premium split in `docs/FEATURE_SPLIT.md` (you said details are given and the extension is being updated aside; keep both in sync) and any cap on source profiles.
- [ ] Early adopter defaults to confirm: over-cap paid purchases are auto-refunded; refunds do not free a slot.
- [ ] Free daily manual-unfollow allowance and whether Free limits source profiles (`FEATURE_SPLIT.md`).
- [ ] Create the Google OAuth client and enable it, if wanted.
- [ ] NOWPayments account, supported crypto networks (see `BILLING.md` for the sandbox steps and the live checklist).
- [ ] Create the NOWPayments API key + IPN secret and add them in Vercel (see `BILLING.md`).
- [ ] Confirm: crypto plans are prepaid periods (30/365 days) with no automatic renewal; refund/chargeback revokes access immediately; late early-adopter payments with no inventory are refunded manually.
- [ ] Approve switching to live mode only after the sandbox checklist passes (`BILLING_LIVE_APPROVED`).
- [ ] Whether to add website analytics (affects the privacy policy).
- [ ] Rename the extension's "premium" speed preset (means X Premium) to avoid confusion.
- [ ] Update the extension's store listing/privacy text, which currently says 100% free and that nothing but anonymous counts is sent.
