# Ride Tracking — Design Direction

> **Status: draft without direction.** This is a placeholder, not a finished design brief. Per antislop R-37, a design without explicit direction is labeled as a draft and shipped with the honest default dials **ENERGY 1 / RHYTHM 1 / MOTION 1**. Replace this file when the product gets a real brand identity.

## What this is

`backoffice/` is an internal admin tool for ride operators. The user is a back-office staff member monitoring live rides, looking up users, and reviewing past rides. The product is operational, not promotional.

## Dial declaration (honest defaults)

- **ENERGY: 2 on the Login page, 1 elsewhere.** Login is the front door and the place to set a tone. Everywhere else is operator-grade calm.
- **RHYTHM: 1** — uniform section rhythm is acceptable here. Operations tools benefit from predictable layouts.
- **MOTION: 1** — hover states, one short pulse after data refresh, and one slow background drift on the login page. No infinite loops.

## Identity motif

- A pair of dots (blue + violet) joined by a short gradient line, evoking start/mid/end on a route. The motif is small enough to live next to a wordmark and big enough to be the one element that survives a logo swap (R-20).
- The full-bleed login illustration is a stylized map with a route, three pins (start / mid / end), a faint grid, and dashed roads. It is bespoke and inline (`src/assets/login-illustration.svg`), not a stock illustration (R-22).

## Palette

- **Neutrals:** gray-50 background, white surfaces, gray-200 borders, gray-700–900 text.
- **Accent:** blue-600 (CTA), blue-700 (focus/active), blue-50 (active background).
- **Login only:** violet-600 as a second accent, used in the identity motif and the route gradient. Pairs with blue-600.
- **Semantic only:** green-700 (active), yellow-700 (warning/error), red-700 (login error).
- **Cap:** 1 accent in the app (blue), 2 accents on the login page (blue + violet). Per-card color blocks (the "different color per stat" default) are out.

## Typography

- System font stack via Tailwind defaults. No monospace-as-aesthetic. No all-caps section labels.
- Reading width target: ≤ 70ch in tables, ≤ 80ch in body text.

## Layout

- Two-column on desktop: 256px fixed sidebar + fluid main.
- On mobile (<768px), sidebar collapses to a hamburger top bar; main gets `pt-20` to clear it.
- No bento grid, no fake terminal window, no glassmorphism in the app body.
- **Login page is the exception.** Full-bleed light gradient mesh background, three soft decorative orbs, a bespoke inline SVG illustration, and one glass card centered on the page. Glass is used exactly once in the entire app — the login card — and nowhere else (R-10 dose cap). The rest of the app stays flat with white surfaces.

## Component rules

- One focal metric per page (the one the operator needs first). Supporting metrics go in a smaller row below.
- Cards: `rounded-xl border border-gray-200`. `shadow-sm` only on the topmost page container, not on every card.
- Status indicators: small dot + plain text, not capsule chips with caps. Dot is color-only for sighted users, paired with the text label for everyone else.
- Buttons: real behavior or removed. No `cursor-pointer` on non-interactive elements.
- Icons: Lucide is fine here, relevance over library-look. No sparkle/star/magic/lightning as defaults.

## Mobile

- Targets: 375px (iPhone SE) up. Verified.
- Tap targets ≥ 44px height (sidebar items, logout, table rows-as-buttons).
- `min-h-screen` not `h-screen` so the URL bar / on-screen keyboard do not crop content.
- All hover-only affordances have a real tap behavior.

## Accessibility

- WCAG AA: 4.5:1 for normal text, 3:1 for large text and non-text UI.
- Visible focus indicator on every interactive element (2px blue outline, 2px offset).
- Every data view has empty / loading / error states, each with the cause and the next action.
- `aria-live="polite"` for live status (Active Rides "Live updates" indicator).

## What is NOT in this document yet

- Real brand voice. Until the team has a tone, copy is short and plain.
- Real product logo. The header reads "Ride Tracking" in text.
- Identity motif. Without one, the design swaps cleanly with any other admin product, which is the R-20 failure this draft accepts. Add a motif (a colored accent line, a signature component, a typographic voice) when the brand lands.

## How to update this file

When a decision changes, edit the section and add a one-line "Decision" comment at the bottom of the changed section. The antislop core rule R-31 requires that every major visual decision has a one-line reason; this file is where those reasons live.
