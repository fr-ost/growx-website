# Free / Premium split

**Product decision (owner):** freemium with a 30-day Premium trial. Useful core functionality stays free indefinitely (including basic scanning, basic account insights and reasonable manual account selection). Premium focuses on advanced automation, higher-volume bulk operations, advanced filtering and future premium tools. No grandfathering: after the extension update every user gets the same experience.

**Enforcement status:** this website does not enforce anything inside the extension yet. The split below is the specification for the extension update (see `EXTENSION_INTEGRATION.md`). The same data feeds the site in `src/config/features.ts`. The extension repository was not modified.

## Principles
1. Free must stay genuinely useful for daily use.
2. Premium = advanced automation, higher volume, bulk operations, advanced filters, future tools.
3. Safety features are never paywalled (emergency stop, adaptive slow-down, verification, active hours, warm-up, health check).
4. Manual, user-driven actions stay free at a reasonable volume; Premium gates volume and automation, not access to your own data.
5. Never delete or silently discard a user's saved settings when they lose Premium; preserve them and clamp at runtime.

## Inventory (from extension v2.3.0 source) and placement

| Area | Feature | Source | Tier |
|---|---|---|---|
| Autopilot | Safe (~150/day) and Balanced (~280/day) paces | `PRESETS` in `shared/config.js` | Free |
| Autopilot | Turbo (~390/day) and X Premium pace (~800/day) | `PRESETS.turbo`, `PRESETS.premium` | Premium |
| Autopilot | Custom delays/caps above Balanced | `LIMITS`, `normalizeSettings` | Premium |
| Autopilot | Active hours, warm-up, adaptive slow-down, follow verification, auto-resume, emergency stop | settings + `background.js` | Free |
| Sources/queue | Source profiles, scored queue, never-follow list, manual queue review | `addSources`, `poolCmd` | Free |
| Targeting | Score, audience size, follow ratio, posts, avatar, protected, boost keywords | `rejectReason`, `scoreUser` | Free |
| Targeting | Include/exclude/location keywords, verified filters, account age, last-active window | `rejectReason` | Premium |
| Targeting | Bulk "Import a list to follow" | dashboard modal | Premium |
| Insight | History, growth chart, source stats, monthly goal planner, backup/restore | analytics, history, settings pages | Free |
| Cleanup | Account scan and review (inactive / not following back) with filters, search, sort | `startScan`, `shared/cleanup.js` | Free |
| Cleanup | Manual selection and unfollow at a safe pace, up to a reasonable daily amount | `unfStart` | Free (limit TBD) |
| Cleanup | Select-all bulk unfollow, Balanced pace (320/day), large batches (up to 5,000 selected) | `UNF_PACES.balanced`, `UNF_MAX_ITEMS` | Premium |
| Future | New advanced automation/analytics tools | not built | Premium |

## Open numbers (need your decision, not invented here)
- Free daily manual-unfollow allowance (suggested: keep it near the Safe unfollow pace's hourly cap so it feels usable; Safe is 200/day in the extension, so a lower free cap such as 50-100/day is one option).
- Whether Free limits the number of source profiles (currently proposed: no limit).

## Naming collision
The extension's speed preset named **"premium"** means *X Premium accounts*, not GrowX Premium. Website copy says "X Premium pace"; consider renaming the preset in the extension.

## Enforcement reality
Extension code runs on the user's machine and can be modified. The server decides who is entitled; the extension honours it. Do not describe client-side restrictions as tamper-proof.
