# VaranasiTrails public website (`client/`)

The public website: browse trips, read a product-style detail page, sign up with an email OTP, keep a wishlist, leave reviews and start a WhatsApp chat to book. There is **no booking or payment system**; bookings happen on WhatsApp.

**Stack:** React 19 · Vite · TypeScript (strict) · React Router (lazy routes) · TanStack Query · Tailwind CSS v4 · react-hook-form + zod · Framer Motion · lucide-react · sonner (toasts) · react-helmet-async (SEO). Fonts: Playfair Display (headings) and Inter (body) via `@fontsource`.

> Full documentation lives in [`../docs/`](../docs/README.md): [Public website guide](../docs/13-client-app.md), [API reference](../docs/06-api-conventions.md#endpoint-index), [Troubleshooting](../docs/17-troubleshooting.md).

## Contents

- [Run it](#run-it)
- [Two ways to run: mock data or the real API](#two-ways-to-run)
- [Environment variables](#environment-variables)
- [Pages and routes](#pages-and-routes)
- [Folder map](#folder-map)
- [How data reaches the screen](#how-data-reaches-the-screen)
- [Authentication in the browser](#authentication-in-the-browser)
- [Editing business content](#editing-business-content-srcdata)
- [Images](#images)
- [Tests, lint and build](#scripts)
- [Production build and deployment](#production-build-and-deployment)

## Run it

```bash
cd client
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server (proxies `/api` to `VITE_DEV_PROXY_TARGET`, default `http://localhost:5001`) |
| `npm run build` | Type-check (`tsc -b`), then production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | oxlint |
| `npm test` | vitest (WhatsApp links, formatters, API client refresh logic, OTP input) |

## Two ways to run

### With no backend: mock mode

1. Put `VITE_USE_MOCKS=true` in `client/.env` (the file must sit next to `package.json`).
2. **Restart `npm run dev`.** Vite reads `.env` only at startup, so editing it while the server runs does nothing.
3. Open http://localhost:5173.

The whole site then works from `src/mocks/`, which returns data shaped exactly like the real API (after a simulated 180 ms delay):

- **10 sample trips** with photos, itinerary, highlights, inclusions, prices and starter reviews, in 4 categories.
- Demo login: `demo@example.com` / `Passw0rd1`.
- Any new signup works; **every OTP step accepts the code `123456`**.
- Accounts and the session survive a page reload (`sessionStorage`). Wishlist, reviews and enquiries reset on reload.

> **"Why is mock data not visible?"** `VITE_USE_MOCKS` must be exactly `true` (lower-case, no quotes). The default and the `.env.example` value is `false`, which calls the real API; with no API running you get "Could not load trips". Fix the value in `client/.env` and restart the dev server. See [Troubleshooting](../docs/17-troubleshooting.md#mock-data-is-not-visible-in-the-website).

### With the real server

Start the API (`npm run dev` inside `server/`), set `VITE_USE_MOCKS=false`, make `VITE_DEV_PROXY_TARGET` equal to the API's `PORT` (for example `http://localhost:5000` if `server/.env` says `PORT=5000`), then run `npm run dev` here. In development the API is reached through Vite's proxy (`VITE_API_URL=/api`), which keeps the `httpOnly` refresh cookie same-origin.

## Environment variables

Read in one place: `src/lib/env.ts`. Only `VITE_` variables reach the browser, and they are **baked in at build time**.

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_URL` | `/api` | API base URL **including `/api`**. In production use the full URL of the API, on the same site as the website (see [Authentication](#authentication-in-the-browser)), for example `https://api.example.com/api` |
| `VITE_USE_MOCKS` | `false` | The exact string `true` serves everything from `src/mocks/` instead of the network |
| `VITE_DEV_PROXY_TARGET` | `http://localhost:5001` | **Dev only**, read by `vite.config.ts`: where `/api` is forwarded. Set it to the API's actual `PORT` |

## Pages and routes

All routes live in `src/app/router.tsx` (each page is a lazy chunk) and share the page shell (header, footer, floating WhatsApp button).

| Path | Page | Needs login | Purpose |
|---|---|---|---|
| `/` | HomePage | no | Hero, featured trips, categories, how it works, why us, FAQ, call to action |
| `/destinations` | DestinationsPage | no | Search, filter, sort, paginate (filters live in the URL) |
| `/destinations/:slug` | DestinationDetailPage | no | Gallery, buy box, highlights, itinerary, inclusions, video, reviews, related trips, enquiry modal |
| `/signup`, `/verify-email`, `/login`, `/forgot-password` | auth pages | no | Account flows with email OTP |
| `/profile` | ProfilePage | **yes** | Your details; the edit-details and change-password forms stay hidden until asked, one open at a time |
| `/wishlist` | WishlistPage | **yes** | Saved trips |
| `/about`, `/contact`, `/privacy`, `/terms` | content pages | no | Text from `src/data/` |
| `*` | NotFoundPage | no | 404 |

## Phone and tablet layout

The site is responsive; below the `md` breakpoint (768 px) the layout changes:

- **Header** is always a solid bar on phones (on larger screens the home page lets the hero sit under a translucent bar). It has a menu button, the logo and a WhatsApp icon.
- **Search bar:** a phone-only search field (`MobileSearchBar`) sits under the header; submitting goes to `/destinations?q=<text>`. The big search box inside the home hero is hidden on phones to avoid a second search.
- **Menu drawer** (`MobileMenu`): greets the user ("Hello, <first name>"), shows a profile card with **See all**, **Switch account** and **Sign out** when logged in (log in / sign up links for visitors), then the site links, WhatsApp and social links.
- **Trip detail:** a sticky bottom bar (`StickyMobileBar`, shown below the `lg` breakpoint) keeps the price and a **Book on WhatsApp** button within reach.
- **Filters** open in a modal drawer instead of a sidebar.
- The page content gets top padding to clear the taller phone header.

## Folder map

```
src/
├── app/          App, router (lazy routes), providers (Query, Helmet, Auth, Toaster), error boundaries, splash
├── pages/        One thin file per route; they compose features
├── features/     auth, destinations, reviews, wishlist, enquiry, home
│                 (each: api.ts, hooks/, components/, plus schemas where needed)
├── components/   ui/ (Button, Input, Modal, Accordion, Tabs ...), layout/ (Header, Footer ...), common/
├── lib/          env, apiClient, whatsapp, format, images, formErrors, cn
├── hooks/        useDebounce, useCountdown, useScrollPosition
├── types/        api.ts: TypeScript types mirroring the API responses
├── data/         ALL editable business content (below)
├── mocks/        mock API used when VITE_USE_MOCKS=true
└── styles/       index.css (Tailwind + design tokens)
```

## How data reaches the screen

1. A component uses a hook (for example `useDestinations(filters)`, TanStack Query).
2. The hook calls the feature's `api.ts` (for example `destinationsApi.list`).
3. That goes through `src/lib/apiClient.ts`: a real `fetch` to `VITE_API_URL` with credentials and the in-memory Bearer token, **or**, when `VITE_USE_MOCKS=true`, the mock router.
4. The result is cached (fresh for 1 minute; categories 5 minutes; 4xx errors are not retried) and rendered.

Errors are `ApiError` objects with `status`, `code` and `errors[]`. Server `VALIDATION_ERROR` field errors are mapped onto form fields; other codes (`EMAIL_NOT_VERIFIED`, `ACCOUNT_EXISTS`, `OTP_INVALID`, `RESET_TOKEN_INVALID`, `REVIEW_EXISTS`, `RATE_LIMITED`, ...) produce inline messages or toasts.

## Authentication in the browser

- The access token lives **in memory only**. The refresh token is an `httpOnly` cookie set by the API. On load the app silently calls `POST /auth/refresh` to restore the session; on a `401` it refreshes once (one shared refresh for concurrent requests) and retries the request once. If refresh fails, the session ends with a toast.
- Signup → `/verify-email?email=…` (6-box code input, 60 s resend countdown) → logged in. Login with an unverified email redirects to the same page. Forgot password is three steps: email, code, new password.
- The server sets the cookie as `SameSite=Lax` by default. **Serve the site and the API from the same site** (for example `app.example.com` and `api.example.com` with `COOKIE_DOMAIN=.example.com` on the API), or the browser will not send the cookie.
- Wishlist toggles are optimistic with rollback. Anonymous visitors are sent to login.
- The API does not say which review belongs to the viewer, so the app remembers the ids of reviews it created (`localStorage`, key `vt_my_reviews`) to offer Edit and Delete on them. An `isMine` flag on authenticated review reads would remove this workaround.

## Editing business content: `src/data/`

Nothing site-wide is hard-coded in components.

| File | What to edit |
|---|---|
| `site.ts` | Brand name, tagline, logo text, email, office address, support hours, SEO defaults, `siteUrl` |
| `social.ts` | Instagram, Facebook, X, YouTube URLs and handles. **All four are `enabled: false` (placeholders)** until the real accounts exist; set `enabled: true` per platform to show it |
| `contact.ts` | Phone, **WhatsApp number** (digits only, international format, no `+`) and the **WhatsApp message templates** |
| `navigation.ts` | Header and footer links |
| `home.ts` | Hero copy, how it works, why choose us, FAQ, call-to-action banner, About page text (marked `TODO(business)`: review every line and add a real "our story") |
| `legal.ts` | Privacy policy and terms text (have a lawyer review) |
| `placeholderMedia.ts` | Temporary photos (below) |

Placeholder values to replace before launch are marked `TODO(business)` or "sample" (for example the phone number and `siteUrl`).

### WhatsApp messages

`src/lib/whatsapp.ts` fills `{token}` placeholders in the templates in `contact.ts` and returns `https://wa.me/<number>?text=<encoded message>`. A sentence that references a token with no value is dropped, so visitors who are not logged in simply get a message without "My name is ...". Tokens: `{destination}`, `{duration}`, `{price}`, `{url}`, `{name}`.

## Images

The 41 photos in `src/data/placeholderMedia.ts` are hotlinked from Wikimedia Commons (CC licensed; each entry carries a `credit`, shown on the hero and About page). Mock mode has ten sample trips (`src/mocks/catalog.ts`), each with its own 3 to 6 photos. Trip photos from the real API come from Cloudflare R2; if a file is missing the site shows a placeholder photo instead (a different one per missing image, never a broken icon).

- Replace a placeholder: change `url`, `alt` and `credit` for that entry (or point it at a file in `public/`).
- Real trip photos are uploaded through the admin panel (the API stores keys like `destinations/<slug>/<random>.webp`).
- Wikimedia thumbnails get a responsive `srcset` automatically (`src/lib/images.ts`). Other sources are used as-is.

## Scripts

See [Run it](#run-it). Tests (`npm test`): `lib/apiClient.test.ts` (refresh-and-retry), `lib/format.test.ts`, `lib/whatsapp.test.ts`, `features/auth/components/OtpInput.test.tsx`, `features/auth/accountUi.test.tsx` (mobile-menu account block and the profile page). Details: [docs/16](../docs/16-testing.md).

## Production build and deployment

```bash
VITE_API_URL=https://api.example.com/api npm run build     # output in dist/
```

- **Docker:** the `Dockerfile` builds with Node and serves `dist/` with nginx. `nginx.conf` proxies `/api/` to `http://server:5001`, caches `/assets/` for a year and falls back to `index.html` for unknown paths. The repository root `docker-compose.yml` runs it together with the API and the admin panel (site on http://localhost:8080).
- **Static host (for example Cloudflare Pages):** root directory `client`, build command `npm run build`, output `dist`, build-time variable `VITE_API_URL`. Add a single-page-app fallback (`/* /index.html 200`) so deep links work.
- Never set `VITE_USE_MOCKS=true` in production.

Full guide: [docs/15](../docs/15-deployment.md).

## Added libraries (beyond the basics)

- `clsx` + `tailwind-merge`: the `cn()` helper for composing Tailwind classes without conflicts.
- `@hookform/resolvers`: connects zod schemas to react-hook-form.
- `vitest`, `jsdom` and `@testing-library/*`: component and unit tests.
- Brand logos (WhatsApp, Instagram, Facebook, X, YouTube) are small inline SVGs because lucide-react no longer ships brand icons.
