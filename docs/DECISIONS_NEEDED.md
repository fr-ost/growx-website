# Decisions and business details needed from you

## Required before launch
- [ ] **Legal entity name, address and jurisdiction** for Privacy/Terms (placeholders are in the drafts). The extension currently says "Unique Labs"; confirm whether that is the entity.
- [ ] **Lawyer review** of `/privacy` and `/terms`; refund policy; definition of "lifetime" (lifetime of the product vs. the user); early-adopter terms.
- [ ] **Production domain** (`NEXT_PUBLIC_SITE_URL`).
- [ ] **Chrome Web Store URL** for GrowX (`NEXT_PUBLIC_CHROME_STORE_URL`); the "Add to Chrome" button stays hidden until set.
- [ ] **Support email** (`NEXT_PUBLIC_SUPPORT_EMAIL`); only Telegram contacts from the extension are shown today.
- [ ] **Extension ID** (for `ALLOWED_EXTENSION_ORIGINS` and the OAuth redirect `https://<id>.chromiumapp.org/`).

## Product decisions
- [ ] **Approve or change the Free/Premium split** (`docs/FEATURE_SPLIT.md`). Note the extension and its listing say "100% free, no limits"; moving features behind Premium is a visible change for existing users. Do you grandfather existing users?
- [ ] Cap on number of **source profiles** or queue size for Free?
- [ ] Is an **X username required to start a trial** (current behaviour, for abuse reduction)? Trade-off: friction vs. abuse.
- [ ] Trial: should it require a confirmed email (current: yes)? Allow trial after a paid plan ended (current: one trial per account ever)?
- [ ] **Grace period** for `past_due` payments (current: none).
- [ ] Early adopter: over-cap policy, whether refunds free a slot, and whether it needs a distinct entitlement label.
- [ ] Google sign-in: create the Google OAuth client and enable it.
- [ ] Merchant of record / paying provider approvals (Paddle business verification, NOWPayments account), supported crypto networks.
- [ ] Should telemetry/analytics be added to the website? (none today; affects privacy policy).
- [ ] Rename the extension's "premium" speed preset to avoid confusion with GrowX Premium.
