# 13. Public website (`client/`)

React 19 + Vite + TypeScript (strict). Visitors browse trips, read a detail page, sign up with an email OTP, keep a wishlist, write reviews and start a WhatsApp chat to book. **There is no booking or payment code.**

Libraries: React Router (lazy routes), TanStack Query, react-hook-form + zod (`@hookform/resolvers`), Tailwind CSS v4, Framer Motion, lucide-react, sonner (toasts), react-helmet-async (SEO), `clsx` + `tailwind-merge` (the `cn()` helper), GSAP (hover details). Fonts: Cormorant Garamond (headlines) and DM Sans (body) through `@fontsource-variable`.

## Pages and routes

Defined in `src/app/router.tsx`. Every page is lazy-loaded (its own chunk). All routes share `PageShell` (header, footer, floating WhatsApp button).

| Path | Page | Auth | What it does |
|---|---|---|---|
| `/` | `HomePage` | public | Hero, **featured trips** (3), category tiles, how it works, why us, FAQ, call-to-action banner |
| `/destinations` | `DestinationsPage` | public | Filterable, sortable, paginated trip grid; filters live in the URL |
| `/destinations/:slug` | `DestinationDetailPage` | public | Gallery + lightbox, buy box, section nav, highlights, itinerary, inclusions/exclusions, video, reviews, related trips, enquiry modal, sticky mobile bar |
| `/signup` | `SignupPage` | public | Create an account, then redirects to verify |
| `/verify-email?email=…` | `VerifyEmailPage` | public | Enter the 6-digit code. Without an `email` query it redirects to `/signup` |
| `/login` | `LoginPage` | public | Email + password. Unverified email redirects to verify |
| `/forgot-password` | `ForgotPasswordPage` | public | 3 steps: email, code, new password |
| `/profile` | `ProfilePage` | **logged in** | Your details; the edit-details and change-password forms stay hidden until asked, one open at a time |
| `/wishlist` | `WishlistPage` | **logged in** | Saved trips |
| `/about`, `/contact` | `AboutPage`, `ContactPage` | public | Static content from `src/data/` |
| `/founders` | `FoundersPage` | public | Founder photos, short introduction with a Know more toggle, phone, email, Instagram and Facebook. Content and photos come from `src/data/founder.ts` and `src/assets/`; empty contact fields are hidden |
| `/careers`, `/careers/:id` | `CareersPage`, `CareerDetailPage` | public | Open positions posted from the admin panel, see [Careers](18-careers.md) |
| `/privacy`, `/terms` | `PrivacyPage`, `TermsPage` | public | Legal text from `src/data/legal.ts` |
| `*` | `NotFoundPage` | public | 404 |

`ProtectedRoute` wraps `/profile` and `/wishlist`: while the session is being restored it shows a spinner; anonymous visitors are sent to `/login` with `state.from` so they return afterwards.

## Design system, theme and motion

Quiet luxury, like a private-estate or safari-lodge brand: ivory, deep forest green and a little brass, with photography leading.

- **Tokens:** one place, `src/styles/index.css` (`@theme`), mirrored in `admin/src/styles/index.css`. Components use the token utilities, never raw hex values:

  | Token | Light | Use |
  |---|---|---|
  | `canvas` | `#F4EFE6` | page background (ivory) |
  | `canvas-alt` | `#EAE3D6` | alternate sections |
  | `paper` | `#F9F6EF` | cards and inputs (never pure white) |
  | `ink` | `#1C1F1A` | headings and body text |
  | `muted` | `#65645A` | secondary text |
  | `forest` | `#1F3A2E` | nav, footer, primary buttons, dark feature sections |
  | `brass` | `#B08D57` | thin rules, small marks, hover states (about 5% of a page) |
  | `brass-text` | `#7A5E34` | brass for text on ivory |
  | `line` | `#D8CFBE` | 1px hairlines |
  | `ivory` | `#F4EFE6` | constant ivory: text on forest and on photographs |

  `muted` and `brass-text` are a shade deeper than the original brief (`#6B6A60`, `#8F6F3F`) so small text passes WCAG AA on both backgrounds (5.2:1 and 5.3:1 on ivory). Ivory on forest is 10.8:1.
- **Shape and depth:** 2px corners everywhere (buttons, inputs, cards, images); 1px hairlines instead of shadows (the shadow tokens resolve to `none`); no glass blur, gradient text or glows.
- **Type:** Cormorant Garamond for headlines (light/regular, large, tight leading) and DM Sans for body and UI; labels are small uppercase DM Sans at 0.14em tracking (`.eyebrow`). Icons are thin-line (lucide at a 1.25px stroke, set globally).
- **Light / dark mode:** dark mode is "the lodge at night": a forest-black canvas, ivory text and brass details, defined under `:root[data-theme="dark"]`. The small sun/moon button (`ThemeToggle`) switches it; the choice is stored in `localStorage` (`vt_theme`), the system setting is followed until one is chosen, and an inline script in `index.html` applies it before the first paint.
- **Motion:** slow and quiet. Fades of 400 to 700 ms (`animate-enter`, `animate-page`, the scroll-driven `.reveal`), a very slow scale drift on the hero photograph, and gentle image zoom on card hover. GSAP (`src/lib/hoverMotion.ts`) drives the hover details on the FAQ and accordion rows (a brass rule grows down the left edge and the question eases right), the "How booking works" steps (a brass rule draws across the top and the numeral lifts) and the "What every trip page tells you" columns (the rule draws over the hairline, the icon lifts). Hovers also run on keyboard focus, reverse smoothly, and are switched off for visitors who prefer reduced motion. No bounce, pulse or animated gradients.

### Home page

- **Hero:** a full-bleed photograph of the Ganges with the copy set low on the left, and a booking bar with hairline-separated fields (where, experience, duration) and one forest button. The bar opens the trips list with those filters applied (`q`, `category`, `minDays` / `maxDays`).
- **Trips:** an editorial grid (one large trip beside two smaller ones on the home page; in lists, every fifth trip is shown wide). Cards are photograph first, then a small uppercase location, a serif title, a muted line and the price in brass.
- **Sections:** featured trips, categories (photo tiles), "How booking works" (forest band), "What every trip page tells you", FAQ (two columns) and a full-bleed photographic call to action.

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
client/
├── public/                 favicon, robots.txt
├── src/
│   ├── main.tsx            fonts + CSS + <App/>
│   ├── app/                App, providers (Query, Helmet, Auth, Toaster), router, error boundaries, Splash
│   ├── pages/              one thin file per route
│   ├── features/
│   │   ├── auth/           AuthProvider, ProtectedRoute, api.ts (auth), userApi.ts, schemas.ts,
│   │   │                   components/ (LoginForm, SignupForm, VerifyEmailForm, OtpInput, Forgot* steps,
│   │   │                   ProfileForm, ChangePasswordForm, PasswordInput, PasswordRules)
│   │   ├── destinations/   api.ts, queryKeys.ts, filterOptions.ts, hooks/ (useDestinations, useDestinationFilters),
│   │   │                   components/ (cards, grid, filters, gallery, lightbox, itinerary, buy box, …)
│   │   ├── reviews/        api.ts, myReviews.ts, hooks/useReviews, components/ (composer, form, list, item, summary)
│   │   ├── wishlist/       api.ts, hooks/useWishlist, components/WishlistButton
│   │   ├── enquiry/        api.ts, schemas.ts, components/ (EnquiryForm, EnquiryModal), hooks/useWhatsAppUrl
│   │   └── home/           sections/ (Hero, FeaturedTrips, Categories, HowItWorks, WhyUs, Faq, CtaBanner, …)
│   ├── components/         ui/ (Button, Input, Modal, Accordion, Tabs, …), layout/ (Header, Footer, …), common/
│   ├── lib/                env, apiClient, whatsapp, format, images, formErrors, cn
│   ├── hooks/              useDebounce, useCountdown, useScrollPosition
│   ├── types/api.ts        TypeScript types mirroring the API responses
│   ├── data/               ALL editable business content (see below)
│   ├── mocks/              mock API (see "Mock mode")
│   ├── styles/index.css    Tailwind + design tokens
│   └── test/setup.ts       vitest setup
├── nginx.conf, Dockerfile  production image (static files + /api proxy)
└── vite.config.ts          dev proxy, alias `@` → src, vitest config
```

## How data reaches the screen

1. A component calls a hook such as `useDestinations(filters)` (TanStack Query).
2. The hook calls a function in the feature's `api.ts` (for example `destinationsApi.list`).
3. That uses the shared client in `src/lib/apiClient.ts`:
   - **Real mode:** `fetch(env.apiUrl + path + query)` with `credentials: "include"` and the in-memory Bearer token.
   - **Mock mode** (`VITE_USE_MOCKS=true`): the request is dispatched to `src/mocks/router.ts` instead of the network.
4. The JSON is cached by TanStack Query and rendered.

Query defaults (`app/providers.tsx`): data is fresh for 60 seconds, no refetch on window focus, and **4xx errors are not retried** (2 retries for network/5xx errors).

| Query | Key | Stale time |
|---|---|---|
| Trip list | `['destinations','list', filters]` (keeps previous page while the next loads) | 1 min |
| Trip detail | `['destinations','detail', slug]` (no retry on 404) | 1 min |
| Categories | `['categories']` | 5 min |
| Wishlist | `['wishlist']` (enabled only when logged in) | 1 min |
| Reviews | per trip, 5 per page | |

## API client behaviour (`src/lib/apiClient.ts`)

- Methods: `api.get(path, query, signal)`, `post`, `put`, `patch`, `delete`. Empty/undefined/null query values are dropped.
- Errors are thrown as `ApiError` with `status`, `code` and `errors[]`. A network failure becomes `ApiError(0, "Cannot reach the server…", "NETWORK_ERROR")`. `204` returns `undefined`.
- **Silent refresh:** the access token is kept in a module variable (never in storage). On a `401` whose code is `TOKEN_INVALID` or missing, and which is not itself an auth call (`/auth/refresh|login|logout|signup`), it calls `POST /auth/refresh` once (shared by all parallel requests) and retries the original request once. If refresh fails the session is cleared and a toast says "Your session has expired. Please log in again."
- `AuthProvider` calls `refreshSession()` on first load to restore the session from the refresh cookie. While that runs, `status` is `loading`; afterwards `authenticated` or `anonymous`.

### Error codes the UI reacts to

| Code | Reaction |
|---|---|
| `VALIDATION_ERROR` | `errors[].field` is mapped onto the form field (`applyServerErrors`) |
| `EMAIL_NOT_VERIFIED` | Login redirects to `/verify-email?email=…`; the review box shows "Verify now" |
| `ACCOUNT_EXISTS` | Inline message on signup |
| `PHONE_EXISTS` | Inline message on the profile form |
| `INVALID_CREDENTIALS` | "Invalid email or password" on login |
| `OTP_INVALID`, `RESET_TOKEN_INVALID` | Inline message on the code / reset steps |
| `INVALID_PASSWORD` | Inline message on change password |
| `REVIEW_EXISTS` | Message on the review form |
| `RATE_LIMITED` | "Too many attempts. Please wait a few minutes and try again." |
| `TOKEN_INVALID`, `REFRESH_INVALID`, `REFRESH_REUSED` | Handled by the refresh logic |
| other | The server `message` is shown in a toast |

## Features in detail

### Browsing trips

- `useDestinationFilters` stores filters in the **URL query string** (`q`, `category`, `minPrice`, `maxPrice`, `minDays`, `maxDays`, `difficulty`, `sort`, `page`), so listings are shareable and the back button works. Changing any filter resets to page 1. Limit is fixed at 12 per page.
- The filter UI offers preset ranges (`filterOptions.ts`): price (Under ₹1,000 · ₹1,000 to ₹2,500 · ₹2,500 to ₹10,000 · ₹10,000 and above), duration (Single day · 2 to 3 days · 4 days or more), difficulty (Easy / Moderate / Challenging) and sort (Most popular, Top rated, Price low to high, Price high to low, Newest).
- Search text is debounced (`useDebounce`).
- On mobile the filters open in a modal drawer.

### Trip detail page

Data comes from one call, `GET /destinations/:slug` (including `latestReviews`, `related` and `ratingBreakdown`). Sections: gallery with lightbox, buy box (price, discount, quick facts, wishlist heart, share via the Web Share API or clipboard, WhatsApp and enquiry buttons), anchored section navigation, highlights, itinerary accordion, inclusions/exclusions, video embed (YouTube iframe or uploaded video), reviews (with rating summary, paging and a composer) and related trips. A sticky bar appears on small screens. Unknown or unpublished slugs show a not-found state.

### Authentication screens

- **Signup** validates name, phone, email and password with live password rules, calls `POST /auth/signup`, then navigates to `/verify-email?email=…` with `state.fromSignup` (so the 60-second resend countdown is already running).
- **Verify email** uses a 6-box `OtpInput`, calls `POST /auth/verify-email`, starts the session and returns to `state.from` or `/`. "Resend" calls `POST /auth/resend-otp` (purpose `EMAIL_VERIFY`) and restarts the countdown.
- **Login** calls `POST /auth/login`. `EMAIL_NOT_VERIFIED` goes to the verify page.
- **Forgot password** is a 3-step flow: `POST /auth/forgot-password`, then `POST /auth/verify-reset-otp` (keeps the `resetToken` in memory), then `POST /auth/reset-password`. Afterwards the user logs in again.
- **Profile** uses `PATCH /users/me` and `POST /users/me/change-password`. The forms are collapsed until you choose to edit, and only one is open at a time.

### Wishlist

`useToggleWishlist` is **optimistic**: it updates the cached list immediately, calls `PUT`/`DELETE /wishlist/:id`, rolls back with an error toast on failure, and refetches on settle. For visitors who are not logged in, the heart prompts login.

### Reviews

- Anyone can read; the composer shows a login prompt for visitors, a "Verify now" link for unverified users and the form for verified users.
- **Edit/Delete for your own review:** the API does not say which review belongs to the viewer, so the browser remembers the id of reviews it created in `localStorage` (`vt_my_reviews`, keyed by `userId:slug`) and offers Edit/Delete on those. (A future `isMine` flag from the API would remove this workaround.)

### Enquiries and WhatsApp

- **WhatsApp** is the main booking route. `src/lib/whatsapp.ts` fills `{token}` placeholders in the templates from `src/data/contact.ts` and builds `https://wa.me/<number>?text=<encoded message>`. Tokens: `{destination}`, `{duration}`, `{price}`, `{url}`, `{name}`. **A sentence that references a token with no value is dropped**, so a visitor who is not logged in gets a message without "My name is …". Templates: `destinationEnquiry` and `generalEnquiry`.
- **Enquiry form** (`EnquiryModal` on a trip page, and the contact page) posts to `POST /enquiries` with name, email, phone, optional `destinationId` and message (same rules as the server).

### SEO

`SeoHead` (react-helmet-async) sets the title (`%s | VaranasiTrails`), description and Open Graph tags per page from `src/data/site.ts`. Login-type pages are `noIndex`.

## Editing business content: `src/data/`

Nothing site-wide is hard-coded in components. Edit these files:

| File | What to edit |
|---|---|
| `site.ts` | Brand name, logo text, tagline, description, `siteUrl`, contact email, office address, support hours, SEO defaults |
| `social.ts` | Instagram / Facebook / X / YouTube URLs and handles. **All four ship as `enabled: false` placeholders**; set `enabled: true` once the real account exists |
| `contact.ts` | Phone, **WhatsApp number** (digits only, international format, no `+`) and the **WhatsApp message templates** |
| `navigation.ts` | Header links (Trips, About, Contact) and footer groups (Explore, Company, Your account) |
| `home.ts` | Hero copy, how-it-works, why-us, FAQ, call-to-action banner and About page text (the file's header says to review every line and add a real "our story") |
| `legal.ts` | Privacy policy and terms of service text (have a lawyer review) |
| `placeholderMedia.ts` | The 41 placeholder photos (hotlinked from Wikimedia Commons, each with `credit`) |

Placeholder values to replace before launch are marked `TODO(business)` or "sample" in the code (for example the phone number `+91 98765 43210` and `siteUrl`).

### Images

- Trip photos from the real API come from R2. If a file fails to load, `ImageWithFallback` swaps in a placeholder photo (a different one per missing image, never a broken icon).
- Wikimedia thumbnails get a responsive `srcset` automatically (`lib/images.ts`, widths 500 / 960 / 1920). Other sources are used as-is.
- To use your own placeholder: change `url`, `alt`, `credit` in `placeholderMedia.ts` or point at a file in `public/`.

## Mock mode

Set `VITE_USE_MOCKS=true` in `client/.env`, then **restart** `npm run dev`. Every call in `lib/apiClient.ts` goes to `src/mocks/router.ts`, which matches the same paths as the real API and returns identically shaped JSON after a simulated 180 ms delay.

| Mock file | Provides |
|---|---|
| `catalog.ts` | 4 categories, **10 sample trips** (with photos, itinerary, highlights, inclusions, prices), starter reviews and rating baselines |
| `catalogHandlers.ts` | categories, list (filters + sorting + paging), detail (+ related), reviews CRUD with rating recompute |
| `authHandlers.ts` | signup, verify-email, resend, login, refresh, logout, forgot/verify-reset/reset password, me |
| `accountHandlers.ts` | `/users/me`, change password, wishlist, enquiries |
| `state.ts` | demo user, stores, helpers |

| Mock behaviour | Value |
|---|---|
| Demo login | `demo@example.com` / `Passw0rd1` |
| Any OTP step | the code **`123456`** |
| Reset token | `mock-reset-token` |
| Persistence | Users and the session survive reload (`sessionStorage`: `vt_mock_users`, `vt_mock_session`). Wishlist, reviews and enquiries live in memory and reset on reload |
| Not implemented | Admin endpoints. Unknown routes throw `404 NOT_FOUND` |

The mock code is loaded lazily, only when the flag is on, so it adds nothing to a real-mode bundle. See [Troubleshooting](17-troubleshooting.md#mock-data-is-not-visible-in-the-website) if mock data does not appear.

## Scripts and tests

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on 5173; proxies `/api` to `VITE_DEV_PROXY_TARGET` |
| `npm run build` | `tsc -b` then production build to `dist/` |
| `npm run preview` | Serve the build |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | oxlint |
| `npm test` | vitest (jsdom) |

Test files: `lib/apiClient.test.ts` (refresh and retry logic), `lib/format.test.ts` (prices, durations, ratings, dates), `lib/whatsapp.test.ts` (template filling), `features/auth/components/OtpInput.test.tsx`, `features/auth/accountUi.test.tsx` (mobile-menu account block, profile page). See [Testing](16-testing.md).

## Production build

The Docker image builds with `npm ci && npm run build` and serves `dist/` with nginx. `nginx.conf` proxies `/api/` to `http://server:5001`, serves `/assets/` with a 1-year immutable cache, and falls back to `index.html` for unknown paths (single-page app). Without Docker, host the `dist/` folder on any static host with an SPA fallback and set `VITE_API_URL` to the API's full URL at **build time** ([Deployment](15-deployment.md)).
