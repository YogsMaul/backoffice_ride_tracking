# Ride Tracking Backoffice

Admin console for the Ride Tracking platform. Operations dashboard, user management, active ride monitoring, ride history, and authentication flows.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- TanStack Query 5
- Axios
- Lucide React (icons)
- React Leaflet 5 (map tiles, prepared)

## Prerequisites

- Node.js 20 or newer
- A running instance of the [ride tracking backend](https://github.com/YogsMaul/backend_ride_tracking)

## Quick start

1. Install dependencies.
   ```bash
   npm install
   ```

2. Copy the example environment file and edit the API URL.
   ```bash
   cp .env.example .env
   ```
   Set `VITE_API_BASE_URL` to the backend address, for example `http://100.76.157.57:8080` or `http://localhost:8080` for local development.

3. Run the dev server. The app binds to `0.0.0.0:3000` so it is reachable from other devices on the network (phones, Tailscale peers, LAN clients).
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in a browser.

## Project layout

```
backoffice/
├── public/             Static assets served at root
├── src/
│   ├── assets/         Bundled images (login illustration, etc.)
│   ├── components/     App shell, layout, shared UI
│   │   ├── ConfirmModal.tsx
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── lib/
│   │   └── api.ts      Axios client and endpoint groups
│   ├── pages/          Route components
│   │   ├── ActiveRides.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Login.tsx
│   │   ├── ResetPassword.tsx
│   │   ├── RideHistory.tsx
│   │   ├── Users.tsx
│   │   └── VerifyOTP.tsx
│   ├── App.tsx         Router and route definitions
│   ├── main.tsx        Entry point
│   └── index.css       Global styles, design tokens, animations
├── docs/
│   ├── DESIGN.md       Design direction and tokens
│   └── design-decisions.md
├── .env.example        Public environment template
├── index.html          Vite entry HTML
├── vite.config.ts      Vite configuration
├── tsconfig.json       TypeScript configuration
└── package.json
```

## Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Base URL of the backend HTTP API. No trailing slash. |

`.env` is git-ignored. Commit only `.env.example`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server with HMR. |
| `npm run build` | Type-check and produce a production build in `dist/`. |
| `npm run preview` | Serve the production build locally for smoke testing. |

## Authentication

The app stores a bearer token in `localStorage` under `admin_token`. The Axios interceptor attaches it to every request, and a `401` response clears the token and redirects to `/login`. The forgot-password flow expects the backend to return an `otp` field in dev mode for testing without SMTP.

## Design and accessibility

- Light and dark themes are both first-class. Theme preference is persisted in `localStorage` and the initial class is applied before React mounts to avoid a flash.
- Focus indicators are visible on every interactive element, with a color tuned for contrast in both themes.
- All text passes WCAG AA contrast against its background. See `docs/DESIGN.md` for the full token list.
- Animations are short and purposeful. They honor `prefers-reduced-motion` and disable themselves when the user requests it.

## Related repositories

- Backend: [backend_ride_tracking](https://github.com/YogsMaul/backend_ride_tracking)

## License

Internal project. Add a license file before publishing.
