# VaranasiTrails API (`server/`)

The REST API behind the public website and the admin panel.

**Stack:** Node.js 24 · Express 5 · TypeScript (strict) · Prisma 7 on SQLite / **Turso (libSQL)** · zod validation · JWT access tokens + rotating refresh-token cookies · email OTPs through **Brevo** · files in **Cloudflare R2** (presigned uploads).

> Full documentation lives in [`../docs/`](../docs/README.md). This README is the quick reference for working inside `server/`. Every endpoint, with request and response details, is documented in [docs 7 to 12](../docs/06-api-conventions.md#endpoint-index).

## Contents

- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [Admin account](#admin-account)
- [Database](#database)
- [Endpoint reference](#endpoint-reference)
- [Conventions](#conventions)
- [Authentication summary](#authentication-summary)
- [Media (R2)](#media-r2)
- [Testing](#testing)
- [Docker](#docker)
- [Deploying](#deploying)

## Quick start

```bash
cd server
npm install
cp .env.example .env          # fill in secrets (R2 values can be dummies locally)
npx prisma generate
npx prisma migrate deploy     # creates ./dev.db from prisma/migrations
npm run seed:destinations     # 9 categories + 7 sample trips (safe to re-run)
npm run dev                   # http://localhost:5001 (or your PORT)
```

```bash
curl http://localhost:5001/health                      # {"status":"ok"}
curl "http://localhost:5001/api/destinations?limit=2"  # sample trips
```

With `NODE_ENV=development` and no `BREVO_API_KEY`, OTP emails are **printed to the server console**. `NODE_ENV` defaults to **production** when unset, so set `development` locally.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Watch mode (`tsx watch src/server.ts`) |
| `npm run build` | `prisma generate` + `tsc` into `dist/` |
| `npm start` | Run `dist/server.js` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | vitest + supertest on a temporary SQLite file; Brevo and R2 are mocked |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | Create a new migration while developing (`prisma migrate dev`) |
| `npm run db:deploy` | Apply migrations to `DATABASE_URL` (`prisma migrate deploy`) |
| `npm run db:studio` | Prisma Studio |
| `npm run seed:destinations` | Idempotent sample categories and trips |
| `npm run seed:admin` | Run the admin bootstrap by hand (the server also does it on every start) |

## Project structure

```
server/
├── prisma/
│   ├── schema.prisma             data model (see docs/04-database.md)
│   └── migrations/               20261105183632_init, 20261105201452_admin_panel
├── prisma.config.ts              Prisma CLI config (reads DATABASE_URL)
├── src/
│   ├── server.ts                 boot: DB check, admin bootstrap, listen, graceful shutdown
│   ├── app.ts                    Express app + middleware chain
│   ├── config/env.ts             zod-validated environment → `config`
│   ├── routes/<feature>/         auth, user, destination (+categories), review, wishlist, enquiry,
│   │                             admin (one router per area, mounted at /api/admin); index.ts mounts all
│   ├── controllers/<feature>/    validate input with zod, call a service, shape the response
│   ├── services/<feature>/       business logic + DB access (auth/ also holds otp + token services)
│   ├── schemas/<feature>/        zod schemas (common/ = shared fields)
│   ├── middleware/               requireAuth (+requireAdmin, requireVerifiedEmail), rateLimit,
│   │                             errorHandler, requestLogger, publicCache
│   ├── lib/                      prisma (libSQL adapter), r2 (S3 client), mailer (Brevo)
│   ├── utils/                    errors, jwt, cookies, crypto, password, slug, csv, pagination, loggers, emailTemplates
│   ├── scripts/                  seedDestinations.ts, seedAdmin.ts
│   └── types/express.d.ts        adds req.user
├── tests/                        vitest + supertest (about 150 cases)
├── Dockerfile, docker-entrypoint.sh, docker-compose.yml (API only)
└── .env.example, .env.docker.example
```

Layering: **route → controller → service → Prisma**. Every admin mutation writes an audit row in the same transaction as the change. See [Architecture](../docs/01-architecture.md).

## Environment variables

Validated with zod at startup; the server refuses to boot with a readable list of problems. Full table: [docs/03](../docs/03-environment-variables.md).

| Variable | Default | Purpose |
|---|---|---|
| `NODE_ENV` | `production` | `development` prints OTP emails to the console when Brevo is not configured |
| `PORT` | `5001` | HTTP port (the web apps' dev proxies must point at it) |
| `TRUST_PROXY_HOPS` | `1` | Reverse proxies in front of the API. Use **2** when Cloudflare proxies the API in front of the host. A wrong value breaks client IPs and rate limiting |
| `DATABASE_URL` / `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` | – | One of the two is required. Turso wins when both are set |
| `JWT_SECRET`, `OTP_SECRET` | required | 32+ characters each |
| `BCRYPT_ROUNDS` | `12` | 4 to 15 |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:5174` | Comma-separated. **Must list both the public site and the admin panel origins** |
| `COOKIE_DOMAIN` | unset | e.g. `.example.com`, so `app.`, `admin.` and `api.` share the session |
| `COOKIE_SAMESITE` | `lax` | `lax` or `none` (`none` forces `Secure`) |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` | – / – / `VaranasiTrails` | Email. The first two are **required in production** |
| `ENQUIRY_NOTIFY_EMAIL` | unset | Where new enquiries are also emailed |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` | required | Cloudflare R2 (dummy values are fine locally) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_PHONE` | unset | Optional bootstrap admin. Email and password must be set together |

## Admin account

The server boots fine without `ADMIN_*`. When `ADMIN_EMAIL` **and** `ADMIN_PASSWORD` are set (password: 10+ characters with upper case, lower case and a number), an idempotent `ensureAdmin()` runs on every start:

- no such account: created (role `ADMIN`, email verified);
- account exists: promoted to `ADMIN`, unblocked and verified if needed;
- the password is re-hashed only if the value in `.env` no longer matches the stored hash, so a restart changes nothing, while **changing `ADMIN_PASSWORD` rotates the password and signs the admin out everywhere**.

What happened is logged (the password never is). The admin logs in through the normal `POST /api/auth/login`; the admin panel then refuses anyone whose role is not `ADMIN`. Public signup always creates a plain `USER`.

## Database

SQLite through Prisma 7 and the libSQL adapter (`src/lib/prisma.ts`): a local file in development (`file:./dev.db`) and Turso in production. The datasource URL is not in `schema.prisma`; the CLI reads it from `prisma.config.ts`.

Tables: `users`, `otps`, `refresh_tokens`, `categories`, `destinations`, `destination_images`, `itinerary_days`, `destination_highlights`, `destination_inclusions`, `reviews`, `wishlist_items`, `enquiries`, `audit_logs`. Every column and rule: [docs/04](../docs/04-database.md).

`prisma migrate` cannot talk to a `libsql://` URL, so apply the migration SQL to Turso with the Turso CLI:

```bash
turso db create varanasitrails && turso db show varanasitrails --url
# New database: apply every migration in order
for f in prisma/migrations/*/migration.sql; do turso db shell varanasitrails < "$f"; done

# Existing database that already has the first migration: only the new one
turso db shell varanasitrails < prisma/migrations/20261105201452_admin_panel/migration.sql

# Later changes: diff the previous schema against the current one
git show HEAD:server/prisma/schema.prisma > old.prisma
npx prisma migrate diff --from-schema old.prisma --to-schema prisma/schema.prisma --script > diff.sql
turso db shell varanasitrails < diff.sql
```

Back up first if the database holds real data (`turso db shell varanasitrails .dump > backup.sql`): the admin-panel migration rebuilds some SQLite tables. Seed Turso by running the seed scripts with `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` exported.

## Endpoint reference

Every route is mounted under `/api` except `/health`. Detailed request and response documentation: [Auth and users](../docs/07-api-auth.md) · [Public catalogue](../docs/08-api-public.md) · [Admin overview](../docs/09-api-admin-overview.md) · [Admin destinations](../docs/10-api-admin-destinations.md) · [Admin media](../docs/11-api-admin-media.md) · [Admin moderation](../docs/12-api-admin-moderation.md).

### Public and user endpoints

| Method | Path | Auth | Body / query | Success |
|---|---|---|---|---|
| GET | `/health` | none | – | `{ status: "ok" }` |
| POST | `/api/auth/signup` | none | `name, phone, email, password` | `201 { message }` (emails an OTP, no login) |
| POST | `/api/auth/verify-email` | none | `email, otp` | `200 { user, accessToken }` + refresh cookie |
| POST | `/api/auth/resend-otp` | none | `email, purpose` | `200 { message }` always |
| POST | `/api/auth/login` | none | `email, password` | `200 { user, accessToken }` + cookie |
| POST | `/api/auth/refresh` | cookie | – | `200 { user, accessToken }`, rotates the cookie |
| POST | `/api/auth/logout` | cookie | – | `200 { message }` |
| POST | `/api/auth/forgot-password` | none | `email` | `200 { message }` always |
| POST | `/api/auth/verify-reset-otp` | none | `email, otp` | `200 { resetToken }` |
| POST | `/api/auth/reset-password` | none | `email, resetToken, newPassword` | `200 { message }`, revokes all sessions |
| GET | `/api/auth/me` | user | – | `{ user }` |
| GET | `/api/users/me` | user | – | `{ user }` |
| PATCH | `/api/users/me` | user | `name?, phone?` | `{ user }` (`409 PHONE_EXISTS`) |
| POST | `/api/users/me/change-password` | user | `oldPassword, newPassword` | `{ message }`, other sessions signed out |
| GET | `/api/categories` | none | – | `{ data: [{ id, slug, name }] }` |
| GET | `/api/destinations` | none | `q, category, minPrice, maxPrice, minDays, maxDays, difficulty, featured, sort, page, limit` | `{ data: DestinationCard[], meta }` |
| GET | `/api/destinations/:slug` | none | – | `{ destination }` (full detail, related, latest reviews) |
| GET | `/api/destinations/:slug/reviews` | none | `page, limit` (max 50) | `{ data, meta }` |
| POST | `/api/destinations/:slug/reviews` | verified user | `rating, title, comment` | `201 { review }` (`409 REVIEW_EXISTS`) |
| PATCH | `/api/destinations/:slug/reviews/:reviewId` | owner | partial | `{ review }` |
| DELETE | `/api/destinations/:slug/reviews/:reviewId` | owner | – | `204` |
| GET | `/api/wishlist` | user | – | `{ data: [card + addedAt] }` |
| PUT | `/api/wishlist/:destinationId` | user | – | `{ wishlisted: true }` (idempotent) |
| DELETE | `/api/wishlist/:destinationId` | user | – | `{ wishlisted: false }` |
| POST | `/api/enquiries` | none | `name, email, phone, destinationId?, message` | `201 { id, message }` (5 per hour per IP) |

### Admin endpoints (`/api/admin`, ADMIN only)

| Area | Endpoints |
|---|---|
| Dashboard | `GET /dashboard` |
| Audit log | `GET /audit-log?action=&entityType=&entityId=&adminId=&q=&from=&to=&page=&limit=` |
| Categories | `GET /categories` · `POST /categories` · `PATCH /categories/reorder` · `PATCH /categories/:id` · `DELETE /categories/:id` |
| Destinations | `GET /destinations` · `POST /destinations` · `GET / PATCH / DELETE /destinations/:id` · `POST /destinations/bulk` · `POST /destinations/:id/publish` `/unpublish` `/duplicate` `/archive` `/restore` · `PATCH /destinations/:id/featured` |
| Media | `POST /uploads/presign` · `POST /destinations/:id/images` · `PATCH /destinations/:id/images/reorder` · `PATCH / DELETE /destinations/:id/images/:imageId` · `PUT / DELETE /destinations/:id/video` |
| Enquiries | `GET /enquiries` · `GET /enquiries/export.csv` · `GET / PATCH / DELETE /enquiries/:id` |
| Users | `GET /users` · `GET /users/:id` · `PATCH /users/:id/block` `/unblock` |
| Reviews | `GET /reviews` · `PATCH /reviews/:id/hide` `/unhide` · `DELETE /reviews/:id` |

Every admin route needs `Authorization: Bearer <accessToken>` of an **ADMIN** user (the role is re-read from the database on each request; others get `401` / `403`) and is rate limited (600 requests / 15 minutes / IP). The admin changes their own password with the normal `POST /api/users/me/change-password`.

Key admin rules (details in the docs):

- **Categories.** The slug is generated from the name and stays stable on rename. A category with trips cannot be deleted (`409 CATEGORY_IN_USE`); deactivate it instead. Inactive categories disappear from `GET /api/categories`; their trips stay public.
- **Destinations.** New trips are drafts (`POST` needs only `title` and `categoryId`). `PATCH` accepts the whole editor form or any subset; the list fields replace the old lists in one transaction.
- **Publishing** (`422 NOT_READY` with a field-level `errors` list otherwise) needs: title, tagline (10+ chars), overview (50+), category, price above 0, duration, at least one image with a cover, at least one itinerary day and one highlight. A live trip cannot be edited into an unpublishable state.
- **Archive** is a soft delete (hidden everywhere public, not editable). **Restore** brings it back as a draft. `DELETE` works only on archived trips and also removes R2 files no other trip uses. **Duplicate** makes a draft "(Copy)" whose image rows point at the same files. **Bulk** returns `{ action, updated, failed: [{ id, message, errors? }] }`.
- **Enquiries.** Statuses `NEW | CONTACTED | CLOSED` with internal `adminNotes`. The list returns `counts` per status. `export.csv` honours the same filters and prefixes cells that start with `= + - @` (or tab/CR) with `'` so spreadsheets cannot run them as formulas.
- **Users and moderation.** Blocking (never yourself or another admin) revokes all their sessions; they get `403 ACCOUNT_BLOCKED` everywhere. Hidden reviews vanish from the public list, counts, rating breakdown and average, in the same transaction.
- **Public visibility.** Drafts, archived trips and hidden reviews never appear in the public API.

## Conventions

- **Errors** are always `{ "message": string, "code"?: string, "errors"?: [{ "field", "message" }] }`. Validation failures are `422 VALIDATION_ERROR`. Every code is listed in [docs/06](../docs/06-api-conventions.md#error-codes).
- **Lists** return `{ "data": [...], "meta": { page, limit, total, totalPages } }`.
- **Money** is whole rupees; **phones** are `+91XXXXXXXXXX`; **dates** are ISO 8601 UTC.
- **Caching:** public catalogue GETs send `Cache-Control: public, max-age=60`.
- **Secrets** (OTPs, reset codes, hashes) never appear in a response. The only token returned from the reset flow is `resetToken` from `verify-reset-otp`.

## Authentication summary

- Send `Authorization: Bearer <accessToken>` (HS256 JWT, **15 minutes**, payload is only the user id). The role, verified and blocked state are read from the database on each request.
- The refresh token is an opaque value stored hashed, sent as the `httpOnly` cookie `refresh_token` (**30 days**, path `/api`, `SameSite=Lax` by default). It **rotates** on every refresh; reusing a rotated token returns `401 REFRESH_REUSED` and revokes all of that user's sessions. Browsers must call the API with `credentials: "include"`.
- OTPs: 6 digits (`crypto.randomInt`), stored as an HMAC keyed with `OTP_SECRET`, valid 10 minutes, single use, locked after 5 wrong attempts, a new OTP invalidates earlier ones, resend cooldown 60 s, at most 5 sends per account per hour.
- Passwords: 8 to 72 bytes with a letter and a number. Phones: Indian mobiles, stored as `+91XXXXXXXXXX`.
- `resend-otp` and `forgot-password` return the same `200` whether or not the account exists (no account enumeration). Clients should run their own 60 s countdown.
- Rate limits (per IP): global 300 / 15 min; login 10 / 15 min; signup 10 / hour; OTP endpoints 10 / 15 min; password reset endpoints 10 / 15 min; enquiries 5 / hour; admin 600 / 15 min. Disabled when `NODE_ENV=test`.
- **Subdomain setup:** serve the site at `app.example.com`, the admin panel at `admin.example.com` and the API at `api.example.com`. Set `COOKIE_DOMAIN=.example.com`, keep `COOKIE_SAMESITE=lax` and list both site origins in `CORS_ORIGIN`. Different registrable domains need `COOKIE_SAMESITE=none` (always `Secure`).

More: [docs/05](../docs/05-authentication-and-security.md).

## Media (R2)

The database stores **object keys only**. `src/lib/r2.ts` turns them into URLs (`publicUrl`, from `R2_PUBLIC_BASE_URL`) and provides `createUploadUrl` (presigned PUT with the content type and length signed in), `headObject` and `deleteObject`. Keys are generated by the server: `destinations/<slug>/<random>.<ext>` and `categories/<slug>/<random>.<ext>`.

Upload flow (the file never passes through the API): **1)** `POST /api/admin/uploads/presign` → `{ key, uploadUrl, publicUrl, expiresIn }` **2)** the browser `PUT`s the file to `uploadUrl` with the same `Content-Type` **3)** `POST /api/admin/destinations/:id/images` `{ key, alt }`, where the API runs an R2 `HEAD` to confirm the file exists and is an allowed type. Allowed: `image/jpeg|png|webp|avif` (max 10 MB) and `video/mp4|webm` (max 50 MB); up to 20 images per trip; exactly one cover is kept at all times. Full details: [docs/11](../docs/11-api-admin-media.md).

**Public bucket.** Enable public access (or attach a custom domain such as `media.example.com`) and set `R2_PUBLIC_BASE_URL` to it.

**Bucket CORS (required for browser uploads from the admin panel).** Cloudflare dashboard → R2 → your bucket → Settings → CORS policy:

```json
[
  {
    "AllowedOrigins": ["https://admin.example.com", "http://localhost:5174"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["content-type", "content-length"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

The R2 API token needs Object Read and Write on the bucket.

## Testing

```bash
npm test                          # all (about 150 cases, full HTTP stack through supertest)
npx vitest run tests/auth.test.ts # one file
```

Tests run against a throwaway SQLite file built from the real migrations; Brevo and R2 are mocked. Files run one after another because they share that file. Details: [docs/16](../docs/16-testing.md).

## Docker

The repository root `docker-compose.yml` runs the API together with the website and the admin panel. This folder also has its own `docker-compose.yml` for the API only:

```bash
cp .env.docker.example .env.docker      # edit ADMIN_* if you want an admin
docker compose up --build               # API on http://localhost:5001
docker compose logs -f server           # OTP codes are printed here
```

The entrypoint runs `prisma migrate deploy`, optionally the sample-data seed (`SEED_ON_START=true`), then the API. Data is kept in a Docker volume.

## Deploying

The server is stateless, reads `PORT`, sets `trust proxy` and exposes `/health`. On a free Node host: build command `npm install --include=dev && npm run build`, start command `npm start`, health check `/health`. Set the production environment variables, apply the migrations to Turso (above), then run the seed scripts once. Full guide and checklist: [docs/15](../docs/15-deployment.md).

## Troubleshooting

See [docs/17](../docs/17-troubleshooting.md). Most common: server refuses to start (read the printed list of invalid variables), CORS errors (add the origin to `CORS_ORIGIN`), every visitor rate-limited (wrong `TRUST_PROXY_HOPS`), no OTP email (in development it is printed in the console).
