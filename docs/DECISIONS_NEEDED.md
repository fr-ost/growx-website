# Decisions and business details

## Decided by the owner
- Legal name: **Shahriar Ahmed Tushar**; address: **Rajshahi, Bangladesh** (used in the privacy/terms drafts).
- Production domain: **https://www.growxapp.net** (default `site.url`; still set `NEXT_PUBLIC_SITE_URL` in Vercel).
- Chrome Web Store: https://chromewebstore.google.com/detail/ofiancichfcakbdgekhcahflpoglfgbh (extension ID `ofiancichfcakbdgekhcahflpoglfgbh`; origin `chrome-extension://ofiancichfcakbdgekhcahflpoglfgbh`; OAuth redirect `https://ofiancichfcakbdgekhcahflpoglfgbh.chromiumapp.org/`).
- Business model: **freemium with a 14-day trial**. Not 100% free any more; **no grandfathering**: all users get the same experience after the extension update.
- The trial **requires an X username** (abuse reduction) and a confirmed email.

## Still open
- [ ] Lawyer review of `/privacy` and `/terms`; governing law/venue; refund policy; meaning of "lifetime"; early-adopter terms; data retention periods.
- [ ] Support email (`NEXT_PUBLIC_SUPPORT_EMAIL`); only Telegram contacts are shown today.
- [ ] Confirm the Free/Premium split in `docs/FEATURE_SPLIT.md` (you said details are given and the extension is being updated aside; keep both in sync) and any cap on source profiles.
- [ ] Grace period for `past_due` payments (current: none).
- [ ] Early adopter: over-cap policy and whether refunds free a slot.
- [ ] Create the Google OAuth client and enable it, if wanted.
- [ ] Paddle business verification, NOWPayments account, supported crypto networks.
- [ ] Whether to add website analytics (affects the privacy policy).
- [ ] Rename the extension's "premium" speed preset (means X Premium) to avoid confusion.
- [ ] Update the extension's store listing/privacy text, which currently says 100% free and that nothing but anonymous counts is sent.
