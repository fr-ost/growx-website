# Decisions and business details

## Decided by the owner
- Legal name: **Shahriar Ahmed Tushar**; address: **Rajshahi, Bangladesh** (used in the privacy/terms drafts).
- Production domain: **https://www.growxapp.net** (default `site.url`; still set `NEXT_PUBLIC_SITE_URL` in Vercel).
- Chrome Web Store: https://chromewebstore.google.com/detail/ofiancichfcakbdgekhcahflpoglfgbh (extension ID `ofiancichfcakbdgekhcahflpoglfgbh`; origin `chrome-extension://ofiancichfcakbdgekhcahflpoglfgbh`; OAuth redirect `https://ofiancichfcakbdgekhcahflpoglfgbh.chromiumapp.org/`).
- Support email: support@growxapp.net. Grace period, early-adopter and provider decisions: see `PRODUCT_REQUIREMENTS.md`.
- Business model: **freemium with a 14-day trial**. Not 100% free any more; **no grandfathering**: all users get the same experience after the extension update.
- The trial **requires an X username** (abuse reduction) and a confirmed email.

## Still open
- [ ] Lawyer review of `/privacy` and `/terms`; governing law/venue; refund policy; meaning of "lifetime"; early-adopter terms; data retention periods.
- [ ] Confirm the Free/Premium split in `docs/FEATURE_SPLIT.md` (you said details are given and the extension is being updated aside; keep both in sync) and any cap on source profiles.
- [ ] Confirm Paddle's actual retry/dunning schedule so the 3-day grace matches it; confirm NOWPayments recurring behaviour (crypto grace is 0 until then).
- [ ] Early adopter defaults to confirm: over-cap paid purchases are auto-refunded; refunds do not free a slot.
- [ ] Free daily manual-unfollow allowance and whether Free limits source profiles (`FEATURE_SPLIT.md`).
- [ ] Create the Google OAuth client and enable it, if wanted.
- [ ] Paddle business verification, NOWPayments account, supported crypto networks.
- [ ] Whether to add website analytics (affects the privacy policy).
- [ ] Rename the extension's "premium" speed preset (means X Premium) to avoid confusion.
- [ ] Update the extension's store listing/privacy text, which currently says 100% free and that nothing but anonymous counts is sent.
