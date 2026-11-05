# VaranasiTrails web app

Public website for VaranasiTrails: browse trips, read a product-style detail page, sign up with email OTP, save a wishlist, leave reviews and start a WhatsApp chat to book. There is **no booking or payment system**; bookings happen on WhatsApp.

React 19, Vite, TypeScript (strict), React Router, TanStack Query, Tailwind CSS v4, react-hook-form + zod, Framer Motion, lucide-react, sonner and react-helmet-async. Fonts: Playfair Display (headings) and Inter (body) via `@fontsource`.

## Run it

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server (proxies `/api` to `http://localhost:5001`) |
| `npm run build` | Type-check, then production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | oxlint |
| `npm test` | vitest (WhatsApp links, formatters, API client refresh logic, OTP input) |

### Two ways to run

**With no backend (mock mode).** Put `VITE_USE_MOCKS=true` in `client/.env`, then `npm run dev`. The whole site works from `src/mocks/`, which returns data shaped exactly like the real API.

- Demo login: `demo@example.com` / `Passw0rd1`.
- Any new signup works; every OTP step accepts the code `123456`.
- Accounts and the session survive a page reload (sessionStorage). Wishlist and reviews reset on reload.

**With the real server.** Start it (`npm run dev` inside `server/`), set `VITE_USE_MOCKS=false`, then `npm run dev` here. In development the API is reached through Vite's proxy (`VITE_API_URL=/api`), which keeps the httpOnly refresh cookie same-origin.

### Environment variables

Read in one place, `src/lib/env.ts`. Copy `.env.example` to `.env` (the file must sit next to `package.json`).

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_URL` | `/api` | API base URL including `/api`. In production use the full URL of the API (same site as the frontend, see Auth notes). |
| `VITE_USE_MOCKS` | `false` | `true` serves everything from `src/mocks/`. |

## Folder map

```
src/
├── app/          App, router (lazy routes), providers, error boundaries, splash
├── pages/        One thin file per route; they compose features
├── features/     auth, destinations, reviews, wishlist, enquiry, home
│                 (each: api.ts, hooks/, components/, plus schemas where needed)
├── components/   ui/ (Button, Input, Modal, Accordion ...), layout/ (Header, Footer ...), common/
├── lib/          env, apiClient, whatsapp, format, images, formErrors, cn
├── hooks/        generic hooks (useDebounce, useCountdown, useScrolledPast)
├── types/        API types mirroring server/README.md
├── data/         ALL business content (see below)
├── mocks/        mock API used when VITE_USE_MOCKS=true
└── styles/       index.css (Tailwind + design tokens)
```

## Editing business content: `src/data/`

Nothing site-wide is hard-coded in components.

| File | What to edit |
|---|---|
| `site.ts` | Brand name, tagline, logo text, email, office address, support hours, SEO defaults, `siteUrl` |
| `social.ts` | Instagram, Facebook, X, YouTube URLs and handles. Set `enabled: false` to hide one |
| `contact.ts` | Phone, **WhatsApp number** (digits only, international format) and the **WhatsApp message templates** |
| `navigation.ts` | Header and footer links |
| `home.ts` | Hero copy, how it works, why choose us, stats, testimonials, FAQ, About page text. Stats and testimonials are **sample content** |
| `legal.ts` | Privacy policy and terms text (have a lawyer review) |
| `placeholderMedia.ts` | Temporary photos (below) |

Placeholder values to replace before launch are marked `TODO(business)` or "sample".

### WhatsApp messages

`src/lib/whatsapp.ts` fills `{token}` placeholders in the templates in `contact.ts` and returns `https://wa.me/<number>?text=<encoded message>`. A sentence that references a token with no value is dropped, so visitors who are not logged in simply get a message without "My name is ...". Tokens used: `{destination}`, `{duration}`, `{price}`, `{url}`, `{name}`.

## Swapping the placeholder images

The 41 photos in `src/data/placeholderMedia.ts` are hotlinked from Wikimedia Commons (CC licensed; each entry carries a `credit`, shown on the hero and About page). Mock mode has **ten sample trips** (`src/mocks/catalog.ts`), each with its own set of 3 to 6 photos, full itinerary, highlights, inclusions, pricing and reviews. Trip photos from the real API come from Cloudflare R2; if a file is missing the site shows a placeholder photo instead (a different one per missing image, never a broken icon).

- Replace a placeholder: change `url`, `alt` and `credit` for that entry (or point it at a file in `public/`).
- Trip images: upload to R2 using the key convention `destinations/<slug>/01.webp`; the server returns full URLs and the site uses them automatically.
- Wikimedia thumbnails get a responsive `srcset` automatically (`src/lib/images.ts`). Other sources are used as-is.

## Auth notes

- The access token lives **in memory only**. The refresh token is an httpOnly cookie. On load the app silently calls `POST /auth/refresh` to restore the session; on a `401` it refreshes once and retries (one shared refresh for concurrent requests).
- Server error codes are handled explicitly: `EMAIL_NOT_VERIFIED` goes to the OTP page, `VALIDATION_ERROR` maps onto form fields, `OTP_INVALID`, `RESET_TOKEN_INVALID`, `ACCOUNT_EXISTS`, `REVIEW_EXISTS` and `RATE_LIMITED` show inline or toast messages.
- The server sets the refresh cookie as `SameSite=Lax`. Serve the site and the API from the same site (for example `www.example.com` and `api.example.com`), or the browser will not send the cookie.
- The API does not say which review belongs to the viewer, so the app remembers the ids of reviews it created (localStorage) to offer Edit and Delete on them. An `isMine` flag on authenticated review reads would remove this workaround.

## Added libraries (beyond the brief)

- `clsx` + `tailwind-merge`: the standard `cn()` helper for composing Tailwind classes without conflicts.
- `@hookform/resolvers`: connects zod schemas to react-hook-form.
- `vitest`, `jsdom` and `@testing-library/*`: component and unit tests.
- Brand logos (WhatsApp, Instagram, Facebook, X, YouTube) are small inline SVGs because lucide-react no longer ships brand icons.
