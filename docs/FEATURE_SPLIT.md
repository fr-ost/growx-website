# Proposed Free / Premium split

**Status: proposal, not enforced by this website.** The shipped extension (v2.3.0) has no accounts and no paywall. The owner has confirmed a freemium model with a 14-day trial and no grandfathering; the extension is being updated separately.
Every feature below was found in the extension source. The same data lives in `src/config/features.ts`.

## Principles
1. Free must stay genuinely useful for daily use (the strategy you set).
2. Premium = higher volume, advanced filtering, bulk operations.
3. Safety features are **never** paywalled (emergency stop, adaptive slow-down, verification, active hours, warm-up).
4. No grandfathering: after the extension update all users get the same Free/Premium experience (owner decision). Announce the change clearly.

## Inventory and proposed placement

| Area | Feature (extension source) | Proposed |
|---|---|---|
| Autopilot | Safe pace (~150/day), Balanced pace (~280/day) (`PRESETS` in `shared/config.js`) | Free |
| Autopilot | Turbo (~390/day) and "Premium" X-Premium pace (~800/day) | Premium |
| Autopilot | Custom delays/caps above Balanced limits | Premium |
| Safety | Active hours, warm-up, adaptive slow-down, follow verification, Alt+Shift+S stop, health check | Free |
| Sources/queue | Source profiles, scored queue, never-follow list | Free (a source-count cap is a business decision, see `DECISIONS_NEEDED.md`) |
| Targeting | Score, audience size, ratio, tweets, avatar, protected, boost keywords | Free |
| Targeting | Include/exclude/location keywords, verified filters, account age, last-active | Premium |
| Targeting | Bulk list import ("Import a list to follow") | Premium |
| Insight | History, growth chart, source stats, goal planner, backup/restore | Free |
| Cleanup | Account scan + review (inactive / not following back) | Free |
| Cleanup | Bulk unfollow runner | Premium |

Note: the extension's `normalizeSettings` currently accepts all of these values. Gating them requires an extension release (see `EXTENSION_INTEGRATION.md`).

## Naming collision
The extension already has a speed preset literally named **"premium"** meaning *X Premium accounts* (the paid X subscription), unrelated to GrowX Premium. Use "X Premium pace" in UI copy to avoid confusion; consider renaming the preset in a later extension release.

## Enforcement reality
Extension code runs on the user's machine and can be modified. Server-side entitlements decide *who is entitled*; the extension can only honour that decision. Hard enforcement is possible only for things that need a server round-trip. This is documented honestly in `EXTENSION_INTEGRATION.md`.
