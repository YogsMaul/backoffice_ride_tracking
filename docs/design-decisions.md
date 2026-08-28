# Design Decisions

Per antislop rule R-31, every major visual decision has a one-line reason. This file logs them in the order they were made.

## Palette (blue + neutrals)

- **Decision:** blue-600 as the single accent on a gray-50 background with white surfaces.
- **Reason:** a back-office tool needs predictable hierarchy. One accent makes "this is the action" instantly readable. The default "4 different colors for 4 stat cards" pattern (R-29) was rejected because it teaches the eye that nothing is more important than anything else.

## One focal metric per page

- **Decision:** Dashboard centers on "Active Rides Right Now". Supporting metrics (Today / Users / Distance) demote to a smaller row.
- **Reason:** an operator on shift cares about the live state. Equal-weight stat cards make the focal metric invisible. R-14 + C-3.

## `shadow-sm` only on the page container

- **Decision:** cards are border + background only; the page-level card gets `shadow-sm`.
- **Reason:** uniform shadow = no elevation hierarchy (R-12). One shadow at the top frames the page; cards inside sit flat.

## Status indicator = small dot + plain text

- **Decision:** status uses `<span>` with a 6px colored dot + the word ("Active", "Suspended", "Pending"). No capsule pill.
- **Reason:** capsules plus thin border plus glow plus uppercase is the R-09 forbidden combo, and pill-shaped status reads as clickable when it is not (R-26 / H-8). The dot is color-only for sighted users; the word carries the same information for everyone.

## `min-h-screen` instead of `h-screen`

- **Decision:** root layout uses `min-h-screen`. Sections inside use `min-h-[]` or content-based height.
- **Reason:** `100vh` includes browser chrome on mobile, so the bottom of the page hides under the address bar. The layoutmobile skill calls this out as a default slop.

## Sidebar collapses to hamburger under 768px

- **Decision:** on mobile, the sidebar slides in from a top-bar hamburger. Main content gets `pt-20` to clear the bar.
- **Reason:** a 256px fixed sidebar on a 375px screen leaves 119px of content width. R-03 requires a real mobile state.

## `animate-pulse` only for 3 seconds after a fresh fetch

- **Decision:** the "Live updates" dot pulses only when data was updated within the last 3 seconds, not forever.
- **Reason:** perpetual motion is wallpaper (R-19). The pulse signals "this just refreshed" — a real UX purpose written down.

## Visible focus ring on every interactive element

- **Decision:** global `:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px }` in `index.css`, plus per-element `focus-visible:ring-2` on form controls.
- **Reason:** R-32 requires a visible focus indicator. Tailwind ring utilities cover buttons and inputs; the global rule covers bare links and the focus state stays consistent in every theme.

## `text-emerald-700` instead of `text-emerald-600` for small deltas

- **Decision:** deltas in the Dashboard focal card use emerald-700, not emerald-600.
- **Reason:** emerald-600 on white is 3.77:1, which fails WCAG AA for normal text (4.5:1). The delta is `text-xs`, not large. Emerald-700 is 4.79:1.

## Empty / loading / error states on every data view

- **Decision:** every page that fetches data has all three states, each with the cause and the next action.
- **Reason:** R-27 is a Hard Gate. The earlier code had loading on Active Rides only; Users and Ride History would have gone blank on a real backend.

## Search input is a real control

- **Decision:** the Users search input has `value`, `onChange`, filters the list, and shows a "no matches" state.
- **Reason:** H-7 (a real audit finding). A textbox the user can type into that does nothing is a broken promise.

## Prefill from `VITE_DEMO_EMAIL` only

- **Decision:** Login prefill is `import.meta.env.VITE_DEMO_EMAIL ?? ''`. Default `.env` is empty; demo env sets both.
- **Reason:** shipping `admin@ride.app / admin123` baked into the source is fabricated content (R-23, R-38) and a real security failure flagged by the security audit. The env-driven prefill is opt-in, not opt-out.

## Login page: light-dominant immersive

- **Decision:** full-bleed soft gradient mesh background (3 radial gradients on near-white), 3 blurred orbs (violet/blue/pink), one bespoke inline SVG (map + route + 3 pins), one glass card centered on the page. ENERGY = 2 on this screen, 1 elsewhere.
- **Reason:** the user asked for "modern but not too dark, with a background illustration". The combination delivers a contemporary feel without falling into the dark-mode default (R-21). The illustration has a direct product connection (R-22): the map + route motif mirrors the actual product (rides on a map). The orbs and the soft background give the page one focal point without becoming wallpaper (R-19, MOTION=1).

## Glass is used exactly once in the app

- **Decision:** the login card is the only `backdrop-blur` element in the codebase. The rest of the app stays on solid white surfaces.
- **Reason:** R-10 forbids glassmorphism on more than 1-2 elements. Using it once, on the marketing-style login screen, frames the page as the "front door" without spreading the effect to the operator surfaces that need to stay readable for long shifts.

## Slow drift on the login illustration

- **Decision:** the login illustration drifts ±1.5% on a 24-second alternate cycle. Respects `prefers-reduced-motion`.
- **Reason:** pure-static would feel static-and-flat; perpetual pulse or bouncy motion would be wallpaper (R-19). A near-imperceptible drift is purposeful ambient motion and reads as a living page, not a template.

## Two accents on the login page only

- **Decision:** the login page adds violet-600 alongside the app's blue-600. The two appear together in the identity motif and the route gradient. The operator pages stay single-accent.
- **Reason:** R-29 caps accents at 1 in the app. The login page is a separate "front door" tone and gets a brief second accent to support the gradient. The cap is written down in `docs/DESIGN.md` so the rule does not get relaxed.
