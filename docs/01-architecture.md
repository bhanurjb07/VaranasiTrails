# 1. Architecture

## System at a glance

```
                       ┌──────────────────────────┐
   Visitors ─────────► │  client  (public site)   │──┐
                       │  React SPA, port 5173    │  │
                       └──────────────────────────┘  │  HTTPS + JSON
                                                     ▼  (cookies: credentials "include")
                       ┌──────────────────────────┐   ┌─────────────────────────────┐
   Staff ────────────► │  admin   (admin panel)   │──►│  server  (REST API, /api)   │
                       │  React SPA, port 5174    │   │  Express 5 + TypeScript     │
                       └───────────┬──────────────┘   └──────┬──────────┬───────────┘
                                   │ direct PUT              │          │
                                   │ (presigned URL)         │ Prisma   │ HTTPS
                                   ▼                         ▼          ▼
                       ┌──────────────────────────┐   ┌────────────┐  ┌──────────────┐
                       │ Cloudflare R2 (photos,   │   │ SQLite file│  │ Brevo (OTP + │
                       │ videos, category images) │   │ or Turso   │  │ enquiry mail)│
                       └──────────────────────────┘   └────────────┘  └──────────────┘
```

- The **client** and **admin** are independent single-page apps. They only know the API's JSON contract.
- The **server** is stateless. All state lives in the database (users, trips, sessions as refresh-token rows, OTP rows) and in R2 (files). You can run several copies behind a load balancer.
- **Images never pass through the API.** The admin browser asks the API for a short-lived signed URL, then uploads directly to R2. The database stores only the object key; the API turns keys into public URLs.
- **Email** (verification codes, password reset codes, enquiry notifications) is sent with Brevo's HTTP API. Without a Brevo key and in `development` mode, emails are printed to the server console instead.
- **There is no payment or booking code.** The WhatsApp link on every trip page is the booking channel. `STRIPE_*` / `RAZORPAY_*` environment variables exist but are reserved and unused.

## Repository layout

```
VaranasiTrails/
├── server/            REST API (Express 5, Prisma 7, zod)
│   ├── prisma/        schema.prisma + migrations/
│   ├── src/
│   │   ├── routes/        one router per feature, mounted in routes/index.ts
│   │   ├── controllers/   parse + validate input, call a service, shape the response
│   │   ├── services/      business logic and database access
│   │   ├── schemas/       zod schemas (request validation)
│   │   ├── middleware/    auth, rate limits, errors, logging, cache header
│   │   ├── lib/           prisma client, R2 client, mailer
│   │   ├── utils/         crypto, jwt, cookies, slug, csv, errors, pagination
│   │   ├── config/env.ts  validated environment
│   │   └── scripts/       seedDestinations.ts, seedAdmin.ts
│   └── tests/         vitest + supertest
├── client/            public website (React SPA)
├── admin/             admin panel (React SPA)
├── docs/              this documentation
├── docker-compose.yml runs server + client + admin together
└── package.json       root scripts (dev / build / test across all three)
```

## Server request lifecycle

Every request goes through the same middleware chain, defined in `server/src/app.ts`:

| Order | Middleware | What it does |
|---|---|---|
| 1 | `requestLogger` | Logs one line per finished request: method, path (no query string), status, duration, IP. `/health` is not logged. |
| 2 | `helmet()` | Standard security headers. |
| 3 | `cors({ origin: CORS_ORIGIN list, credentials: true })` | Allows only the listed origins, and allows cookies. |
| 4 | `globalLimiter` | 300 requests per 15 minutes per IP (see [rate limits](05-authentication-and-security.md#rate-limits)). |
| 5 | `express.json({ limit: "100kb" })` | Parses JSON bodies. Larger bodies return `413`. Malformed JSON returns `400`. |
| 6 | `cookieParser()` | Makes `req.cookies.refresh_token` available. |
| 7 | `GET /health` | Returns `{ "status": "ok" }`. |
| 8 | `/api` router | Feature routers (below). |
| 9 | `notFoundHandler` | Unknown route: `404 { code: "NOT_FOUND" }`. |
| 10 | `errorHandler` | Converts every thrown error into the standard error JSON (see [API conventions](06-api-conventions.md)). |

### Route map

```
/api/auth          signup, verify-email, resend-otp, login, refresh, logout,
                   forgot-password, verify-reset-otp, reset-password, me
/api/users         me (get/patch), me/change-password                    [auth]
/api/destinations  list, :slug, :slug/reviews (list/create/update/delete)
/api/categories    list
/api/wishlist      list, add, remove                                     [auth]
/api/enquiries     create
/api/admin         dashboard, audit-log, categories, destinations, uploads,
                   enquiries, users, reviews                             [ADMIN only]
/health            liveness probe (outside /api)
```

### Layering rules

Each feature follows the same four layers. Knowing them tells you where to look:

1. **Route** (`routes/<feature>/*.routes.ts`): maps HTTP method and path to a controller and attaches middleware (auth, limiter, cache header).
2. **Controller** (`controllers/<feature>/*.controller.ts`): validates `req.params`, `req.query` and `req.body` with a zod schema from `schemas/`, calls one service function, and decides the status code and JSON shape. A zod failure throws and becomes `422 VALIDATION_ERROR`.
3. **Service** (`services/<feature>/*.service.ts`): business rules and all Prisma calls. Throws `AppError` for expected failures (`conflict(...)`, `notFound(...)`, and so on).
4. **Schema** (`schemas/<feature>/*.schemas.ts`): zod definitions. `schemas/common` holds shared field rules (`emailField`, `phoneField`, `passwordField`, `otpField`, pagination).

Mutating admin actions write an **audit row in the same database transaction** as the change, so an action and its audit entry commit or roll back together.

## How a request flows: "admin publishes a trip"

1. Admin panel calls `POST /api/admin/destinations/:id/publish` with `Authorization: Bearer …`.
2. `requireAuth` verifies the JWT, then loads the user to make sure the account still exists and is not blocked.
3. `requireAdmin` re-reads the role from the database (the token only carries the user id).
4. `adminLimiter` counts the request (600 per 15 minutes per IP).
5. The controller validates the `:id` param and calls `publishDestination(adminId, id)`.
6. The service loads the trip, checks it is not archived, runs `checkReadiness` and throws `422 NOT_READY` with field-level errors if anything is missing.
7. In one transaction it sets `isPublished = true` (and `publishedAt` the first time) and writes an `audit_logs` row `destination.publish`.
8. The service returns the full admin view of the trip; the controller sends `200 { "destination": { … } }`.
9. The admin panel replaces its cached copy and refreshes lists and the dashboard.

## Frontend architecture (both SPAs)

Both apps share the same approach, so learning one teaches you the other:

| Concern | Choice |
|---|---|
| Routing | React Router with **lazy-loaded pages** (every page is its own JS chunk) |
| Server state | TanStack Query (caching, retries, optimistic updates) |
| Forms | react-hook-form + zod, with server `VALIDATION_ERROR` field errors mapped back onto fields |
| Styling | Tailwind CSS v4 with design tokens in `src/styles/index.css`; fonts Playfair Display (headings) and Inter (body) |
| API access | One `apiClient.ts` per app. The **access token lives in memory only**; the refresh token is an `httpOnly` cookie. A `401` triggers one shared refresh, then one retry. |
| Environment | Read in exactly one file, `src/lib/env.ts`; everything else imports `env`. |
| Folder shape | `app/` (shell, router, providers) · `pages/` (thin route files) · `features/<name>/` (api, hooks, components) · `components/` (ui, layout) · `lib/` · `hooks/` · `types/` |

Details live in [Public website](13-client-app.md) and [Admin panel](14-admin-app.md).

## Key design decisions

| Decision | Reason |
|---|---|
| The access token contains only the user id (`sub`). Role, blocked state and email verification are read from the database on each request. | Blocking a user or demoting an admin takes effect immediately, not after the 15-minute token expiry. |
| OTP codes and reset tokens are stored as HMAC hashes; refresh tokens as SHA-256 hashes. | A database leak does not leak usable secrets. |
| Refresh tokens rotate on every use; reuse of a rotated token revokes all of the user's sessions. | Detects stolen refresh cookies. |
| Trips are soft-deleted ("archived"); permanent delete is only allowed for archived trips. | Prevents accidental data loss. |
| `ratingAvg` / `ratingCount` are stored on the trip and recomputed in the same transaction as every review change. | List and detail pages never need to aggregate reviews. |
| Public lists never show drafts, archived trips or hidden reviews. | One rule, enforced in the query `where` clauses of every public service. |
| Photos are uploaded straight to R2 using a presigned URL whose content type and length are signed in. | Keeps large files off the API and lets R2 reject mismatched uploads. |
| The server picks every storage key; the browser never chooses a path. | Prevents overwriting other files or uploading to arbitrary locations. |
| Unknown/duplicate email checks return the same generic response where it matters (`resend-otp`, `forgot-password`, `reset-password`). | Prevents using the API to discover which emails have accounts. |
