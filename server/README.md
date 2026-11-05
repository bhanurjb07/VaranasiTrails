# VaranasiTrails API

Express 5 + TypeScript + Prisma 7 (libSQL / Turso) + zod. Auth uses email OTPs (Brevo), short-lived access JWTs and rotating refresh-token cookies. Images live in Cloudflare R2.

```
src/
├── routes/<feature>/       auth, user, destination (+categories), review, wishlist, enquiry
├── controllers/<feature>/  parse + validate input, call a service, shape the response
├── services/<feature>/     business logic + DB access (auth/ also holds otp + token services)
├── schemas/<feature>/      zod schemas (common/ = shared fields)
├── middleware/ · lib/ (prisma, r2, mailer) · utils/ · config/env.ts · scripts/
```

## Quick start

```bash
cd server
npm install
cp .env.example .env          # fill in secrets (R2 values can be dummies locally)
npx prisma generate
npx prisma migrate deploy     # creates ./dev.db from prisma/migrations
npm run seed:destinations     # 4 categories, 7 trips
npm run dev                   # http://localhost:5001
```

With `NODE_ENV=development` and no `BREVO_API_KEY`, OTP emails are printed to the server console.

| Command | What it does |
|---|---|
| `npm run dev` | Watch mode (tsx) |
| `npm run build` / `npm start` | `prisma generate` + `tsc`, then run `dist/server.js` |
| `npm run typecheck` | Type check only |
| `npm test` | vitest + supertest against a temp SQLite file; Brevo is mocked |
| `npm run db:migrate` | Create a new migration while developing (`prisma migrate dev`) |
| `npm run db:deploy` | Apply migrations to the `DATABASE_URL` file |
| `npm run seed:destinations` | Idempotent sample data (re-run safely) |
| `npm run seed:admin` | Create/promote the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (see below) |

### Environment

Validated with zod at startup; the server refuses to boot with a clear list of problems. Required: `DATABASE_URL` or `TURSO_DATABASE_URL` (+ `TURSO_AUTH_TOKEN`), `JWT_SECRET`, `OTP_SECRET` (both 32+ chars), `R2_*`, and `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` when `NODE_ENV=production`. `NODE_ENV` defaults to **production**. See `.env.example`.

`ADMIN_EMAIL` / `ADMIN_PASSWORD` are only read by `npm run seed:admin`, never by the server. Signup always creates a `USER`.

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='Str0ngPassw0rd' ADMIN_PHONE=9876543210 npm run seed:admin
```

## Database: local SQLite and Turso

Local development uses `file:./dev.db` (relative to `server/`). Prisma 7 keeps the URL out of `schema.prisma`: the CLI reads it from `prisma.config.ts`, and the runtime connects through `@prisma/adapter-libsql` (`src/lib/prisma.ts`), which handles both a file and Turso.

`prisma migrate` cannot talk to a `libsql://` URL, so apply the migration SQL to Turso with the Turso CLI:

```bash
# first time: turso db create varanasitrails && turso db show varanasitrails --url
# Apply every migration file in order (new databases):
for f in prisma/migrations/*/migration.sql; do turso db shell varanasitrails < "$f"; done

# Later schema changes: after `npm run db:migrate` locally, apply just the new
# migration folder...
turso db shell varanasitrails < prisma/migrations/<new_migration>/migration.sql

# ...or diff the previous schema against the current one (SQL on stdout):
git show HEAD:server/prisma/schema.prisma > old.prisma
npx prisma migrate diff --from-schema old.prisma --to-schema prisma/schema.prisma --script > diff.sql
turso db shell varanasitrails < diff.sql
```

Seed Turso by running the seed scripts with `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` exported.

## Media (R2)

The database stores **object keys only**. Convention: `destinations/<slug>/<NN>.webp` (`01` is the cover). `src/lib/r2.ts` exposes `publicUrl(key)` (built from `R2_PUBLIC_BASE_URL`) and `createUploadUrl(key, contentType)` (presigned PUT, no route yet).

## Conventions

- Errors are always `{ "message": string, "code"?: string, "errors"?: [{ "field", "message" }] }`. Validation failures are `422` / `VALIDATION_ERROR`.
- Auth: send `Authorization: Bearer <accessToken>` (15 min). The refresh token is an `httpOnly`, `Secure`, `SameSite=Lax` cookie (`refresh_token`, 30 days, path `/api`). Browsers must call the API with `credentials: "include"`.
- Lists return `{ "data": [...], "meta": { page, limit, total, totalPages } }`.
- Secrets (OTPs, reset codes, hashes) never appear in a response. The only token returned from a reset flow is the `resetToken` from `verify-reset-otp`, which is the point of that call.

## Endpoints

### Auth - `/api/auth`

| Method | Path | Body | Success |
|---|---|---|---|
| POST | `/signup` | `name, phone, email, password` | `201 { message }` (emails an OTP, no login) |
| POST | `/verify-email` | `email, otp` | `200 { user, accessToken }` + refresh cookie |
| POST | `/resend-otp` | `email, purpose` (`EMAIL_VERIFY` \| `PASSWORD_RESET`) | `200 { message }` always |
| POST | `/login` | `email, password` | `200 { user, accessToken }` + cookie |
| POST | `/refresh` | cookie | `200 { user, accessToken }`, rotates cookie |
| POST | `/logout` | cookie | `200 { message }` |
| POST | `/forgot-password` | `email` | `200 { message }` always |
| POST | `/verify-reset-otp` | `email, otp` | `200 { resetToken }` |
| POST | `/reset-password` | `email, resetToken, newPassword` | `200 { message }`, revokes all sessions |
| GET | `/me` | - | `200 { user }` (auth) |

```http
POST /api/auth/signup
{ "name": "Asha Verma", "phone": "9876543210", "email": "asha@example.com", "password": "Passw0rdOK" }
-> 201 { "message": "Account created. We emailed you a 6-digit code to verify your email." }

POST /api/auth/verify-email
{ "email": "asha@example.com", "otp": "081236" }
-> 200 { "user": { "id": "...", "name": "Asha Verma", "email": "asha@example.com", "phone": "+919876543210",
           "role": "USER", "emailVerified": true, "createdAt": "..." }, "accessToken": "eyJ..." }

POST /api/auth/login   (email not verified)
-> 403 { "message": "Please verify your email before logging in", "code": "EMAIL_NOT_VERIFIED" }
```

Rules: OTPs are 6 digits (`crypto.randomInt`), stored as HMAC-SHA256 keyed with `OTP_SECRET`, valid 10 minutes, single use, locked after 5 wrong attempts, and a new OTP invalidates earlier ones of that purpose. Resend cooldown is 60 s per purpose and at most 5 sends per account per hour. Passwords: 8-72 bytes with a letter and a number. Phones: Indian mobiles, stored as `+91XXXXXXXXXX`.

Choices made where the brief left room:
- `resend-otp` and `forgot-password` silently skip sending during the cooldown or past the hourly cap and still return the same `200`, because a `429` there would reveal which emails have accounts. Clients should run their own 60 s countdown.
- Reuse of an already-rotated refresh token returns `401 REFRESH_REUSED` and revokes all of that user's sessions.
- The cookie is `SameSite=Lax`, so the frontend and API must be same-site (for example `app.example.com` and `api.example.com`). A different registrable domain needs `SameSite=None`, which is a one-line change in `src/utils/cookies.ts`.
- The access token holds only the user id; `requireAdmin` and the verified-email check read the database.
- Global rate limit is 300 requests / 15 min per IP; login, signup, OTP and reset endpoints are stricter. Limits are disabled when `NODE_ENV=test`.

### Users - `/api/users` (auth)

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/me` | - | `{ user }` |
| PATCH | `/me` | `name?`, `phone?` | `{ user }` (`409` if the phone is taken) |
| POST | `/me/change-password` | `oldPassword, newPassword` | `{ message }`, other sessions signed out |

### Destinations (public, `Cache-Control: public, max-age=60`)

`GET /api/categories` -> `{ "data": [{ "id", "slug", "name" }] }`

`GET /api/destinations?q=&category=&minPrice=&maxPrice=&minDays=&maxDays=&difficulty=&featured=&sort=&page=&limit=`
`sort`: `price_asc | price_desc | rating | newest | popular` (default `popular`). `limit` max 24 (default 12).

```json
{ "data": [{ "id": "...", "slug": "ganga-aarti-boat-ride", "title": "Ganga Aarti & Evening Boat Ride",
    "tagline": "...", "city": "Varanasi",
    "coverImage": "https://media.example.com/destinations/ganga-aarti-boat-ride/01.webp",
    "priceInr": 1499, "originalPriceInr": 1999, "discountPercent": 25,
    "duration": { "days": 1, "nights": 0 }, "ratingAvg": 0, "ratingCount": 0 }],
  "meta": { "page": 1, "limit": 12, "total": 7, "totalPages": 1 } }
```

`GET /api/destinations/:slug` -> `{ "destination": { ...card fields, overview, state, country, category, maxGroupSize, difficulty, bestTimeToVisit, meetingPoint, videoUrl, images: [{url, alt, isCover}], highlights: [string], itinerary: [{dayNumber, title, description}], inclusions: [string], exclusions: [string], ratingBreakdown: {"1".."5": count}, latestReviews: [5 newest], related: [up to 6 cards] } }`. Unpublished or unknown slugs return `404`.

### Reviews

| Method | Path | Notes |
|---|---|---|
| GET | `/api/destinations/:slug/reviews?page=&limit=` | public, `limit` max 50 (default 10) |
| POST | `/api/destinations/:slug/reviews` | auth + verified email. `{ rating 1-5, title, comment }`. `409 REVIEW_EXISTS` on a second review |
| PATCH | `/api/destinations/:slug/reviews/:reviewId` | own review, partial body |
| DELETE | `/api/destinations/:slug/reviews/:reviewId` | own review, `204` |

`ratingAvg` / `ratingCount` are recomputed in the same transaction as every write.

### Wishlist - `/api/wishlist` (auth)

`GET /` -> `{ data: [card + addedAt] }` · `PUT /:destinationId` -> `{ wishlisted: true }` (idempotent) · `DELETE /:destinationId` -> `{ wishlisted: false }`

### Enquiries

`POST /api/enquiries` (public, 5 per hour per IP): `{ name, email, phone, destinationId?, message }` -> `201 { id, message }`. Stored in the database and emailed to `ENQUIRY_NOTIFY_EMAIL` when set (a mail failure is logged but does not fail the request).

### Health

`GET /health` -> `{ "status": "ok" }`

## Deploying on a free Node host

The server is stateless, reads `PORT`, sets `trust proxy`, and exposes `/health`. Build command: `npm install --include=dev && npm run build`; start command: `npm start`. Set the environment variables from `.env.example` (production values), apply the migrations to Turso as above, then run the seed scripts once.
