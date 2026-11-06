# VaranasiTrails API

Express 5 + TypeScript + Prisma 7 (libSQL / Turso) + zod. Auth uses email OTPs (Brevo), short-lived access JWTs and rotating refresh-token cookies. Images live in Cloudflare R2.

```
src/
├── routes/<feature>/       auth, user, destination (+categories), review, wishlist, enquiry,
│                           admin (one router per area, mounted at /api/admin)
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
npm run seed:destinations     # 9 categories, 7 trips
npm run dev                   # http://localhost:5001
```

With `NODE_ENV=development` and no `BREVO_API_KEY`, OTP emails are printed to the server console.

| Command | What it does |
|---|---|
| `npm run dev` | Watch mode (tsx) |
| `npm run build` / `npm start` | `prisma generate` + `tsc`, then run `dist/server.js` |
| `npm run typecheck` | Type check only |
| `npm test` | vitest + supertest against a temp SQLite file; Brevo and R2 are mocked |
| `npm run db:migrate` | Create a new migration while developing (`prisma migrate dev`) |
| `npm run db:deploy` | Apply migrations to the `DATABASE_URL` file |
| `npm run seed:destinations` | Idempotent sample data (re-run safely) |
| `npm run seed:admin` | Run the admin bootstrap by hand (the server also does it on every start) |

### Environment

Validated with zod at startup; the server refuses to boot with a clear list of problems. Required: `DATABASE_URL` or `TURSO_DATABASE_URL` (+ `TURSO_AUTH_TOKEN`), `JWT_SECRET`, `OTP_SECRET` (both 32+ chars), `R2_*`, and `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` when `NODE_ENV=production`. `NODE_ENV` defaults to **production**. See `.env.example`.

| Variable | Default | Purpose |
|---|---|---|
| `TRUST_PROXY_HOPS` | `1` | Reverse proxies in front of the server. Set to **2** when Cloudflare proxies the API in front of the host. A wrong value breaks client IPs and rate limiting. |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:5174` | Comma-separated. **Must list both the public site and the admin panel origins**, e.g. `https://app.example.com,https://admin.example.com`. |
| `COOKIE_DOMAIN` | unset | Parent domain for the refresh cookie, e.g. `.example.com`, so `app.`, `admin.` and `api.` share a session. |
| `COOKIE_SAMESITE` | `lax` | `lax` or `none`. `none` forces `Secure`. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_PHONE` | unset | Optional bootstrap admin (below). Both email and password must be set together. |

#### Admin account

The server boots fine without any `ADMIN_*` variables. When `ADMIN_EMAIL` **and** `ADMIN_PASSWORD` are set (password: 10+ characters with upper case, lower case and a number), the server runs an idempotent `ensureAdmin()` on every start:

- no such account: it is created (role `ADMIN`, email verified);
- account exists: it is promoted to `ADMIN` and unblocked if needed;
- the password is re-hashed only if the value in `.env` no longer matches the stored hash, so a restart changes nothing, while **changing `ADMIN_PASSWORD` rotates the password and signs the admin out everywhere**.

What happened is logged (the password never is). The admin logs in through the normal `POST /api/auth/login`; the admin panel then refuses anyone whose `user.role` is not `ADMIN`. Signup always creates a plain `USER`. `npm run seed:admin` runs the same function by hand.

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

**Applying the admin-panel migration to Turso.** The admin work added migration `20261105201452_admin_panel` (user blocking, category fields, destination SEO + soft delete, image type/size, enquiry status, review hiding, `audit_logs`). On an existing Turso database that already has the first migration (`..._init`), apply only the new one:

```bash
turso db shell varanasitrails < prisma/migrations/20261105201452_admin_panel/migration.sql
```

Check `ls prisma/migrations` for the exact folder name. A fresh database takes every migration in order (the loop above). The migration rebuilds some SQLite tables, so take a backup first (`turso db shell varanasitrails .dump > backup.sql`) if the database holds real data.

## Media (R2)

The database stores **object keys only**; `src/lib/r2.ts` turns them into URLs (`publicUrl`, from `R2_PUBLIC_BASE_URL`) and also provides `createUploadUrl` (presigned PUT with the content type and length signed in), `headObject` and `deleteObject`. Keys are generated by the server: `destinations/<slug>/<random>.<ext>`.

**Public bucket.** Enable public access on the bucket (or attach a custom domain such as `media.example.com`) and set `R2_PUBLIC_BASE_URL` to it.

**Bucket CORS (required for browser uploads from the admin panel).** In the Cloudflare dashboard: R2, your bucket, Settings, CORS policy:

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

Replace the origins with your admin origin(s). The R2 API token needs Object Read and Write on the bucket.

## Conventions

- Errors are always `{ "message": string, "code"?: string, "errors"?: [{ "field", "message" }] }`. Validation failures are `422` / `VALIDATION_ERROR`.
- Auth: send `Authorization: Bearer <accessToken>` (15 min). The refresh token is an `httpOnly`, `Secure` cookie (`refresh_token`, 30 days, path `/api`), `SameSite=Lax` by default (`COOKIE_SAMESITE`), optionally shared across subdomains (`COOKIE_DOMAIN`). Browsers must call the API with `credentials: "include"`. Blocked users get `403 ACCOUNT_BLOCKED` everywhere (checked on every authenticated request).
- **Subdomain setup:** serve the public site at `app.example.com`, the admin panel at `admin.example.com` and the API at `api.example.com`. Set `COOKIE_DOMAIN=.example.com`, keep `COOKIE_SAMESITE=lax`, and list both site origins in `CORS_ORIGIN`. Because they share a registrable domain, `Lax` cookies work and CSRF protection stays intact. Different registrable domains need `COOKIE_SAMESITE=none` (always `Secure`).
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

**Signup and pending accounts.** An account stays *pending* until its email is verified with the OTP, and nobody owns an unverified email or phone. So signing up with an email or phone that belongs to a **pending** account does not return 409: the pending account's name, phone and password are replaced by the new submission (its sessions and unused OTPs are revoked) and a fresh OTP is sent. If the email matches one pending account and the phone another, the two are merged into one. A **verified** account always wins: `409 ACCOUNT_EXISTS` (also when only the phone belongs to a verified account). If the OTP email fails to send (`502 EMAIL_SEND_FAILED`), the OTP is rolled back and the same request can be retried immediately. Signup ignores the 60 s resend cooldown (it is a deliberate new submission) but still honours the hourly cap (`429 OTP_SEND_LIMIT`).

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


## Admin API - `/api/admin`

Every route needs `Authorization: Bearer <accessToken>` of an **ADMIN** user (role re-read from the database on each request; others get `401` / `403`) and is rate limited (600 requests / 15 min / IP). Every mutating action writes an audit row. Lists return `{ data, meta }`; single items `{ <name>: {...} }`.

| Area | Endpoints |
|---|---|
| Dashboard | `GET /dashboard` |
| Audit log | `GET /audit-log?action=&entityType=&entityId=&adminId=&q=&from=&to=&page=&limit=` |
| Categories | `GET /categories` · `POST /categories` · `PATCH /categories/reorder` `{ids}` · `PATCH /categories/:id` · `DELETE /categories/:id` |
| Destinations | `GET /destinations` · `POST /destinations` · `GET/PATCH/DELETE /destinations/:id` · `POST /destinations/bulk` · `POST /:id/publish` `/unpublish` `/duplicate` `/archive` `/restore` · `PATCH /:id/featured` |
| Media | `POST /uploads/presign` · `POST /destinations/:id/images` · `PATCH /:id/images/reorder` · `PATCH/DELETE /:id/images/:imageId` · `PUT/DELETE /:id/video` |
| Enquiries | `GET /enquiries` · `GET /enquiries/export.csv` · `GET/PATCH/DELETE /enquiries/:id` |
| Users | `GET /users` · `GET /users/:id` · `PATCH /users/:id/block` `/unblock` |
| Reviews | `GET /reviews` · `PATCH /reviews/:id/hide` `/unhide` · `DELETE /reviews/:id` |

The admin changes their own password with the normal `POST /api/users/me/change-password`.

**Categories.** Slug is generated from the name (unique, stable on rename). A category with destinations cannot be deleted (`409 CATEGORY_IN_USE`; deactivate it instead). Inactive categories disappear from `GET /api/categories`; their trips stay public. `PATCH /categories/reorder` takes every id in the new order.

**Destinations.** New trips are drafts: `POST` needs only `title` and `categoryId`. `PATCH` accepts the whole editor form (any subset): scalars plus `highlights: string[]`, `itinerary: {title, description}[]` (days numbered by position), `inclusions: string[]`, `exclusions: string[]`, replaced in one transaction. `originalPriceInr` must exceed `priceInr`. `slug` can be edited (`409 SLUG_TAKEN`). List filters: `q`, `status` (`all` = everything except archived | `published` | `draft` | `archived`), `category` (id or slug), `featured`, `sort` (`updated` | `newest` | `title` | `price_asc` | `price_desc`). Detail includes `readiness: { ready, errors: [{field, message}] }`.

*Publishing* (`422 NOT_READY` with a field-level `errors` list otherwise) needs: title, tagline (10+ chars), overview (50+ chars), category, price above 0, duration, at least one image and a cover, at least one itinerary day and one highlight. A live trip cannot be edited into an unpublishable state.
*Archive* is a soft delete (hidden everywhere public, not editable); *restore* brings it back as a draft; `DELETE` works only on archived trips and also removes R2 files that no other trip uses. *Duplicate* copies everything into a draft titled "(Copy)" whose image rows point at the same files; a file is deleted from R2 only when no image row or video of any trip still references it. `POST /destinations/bulk` takes `{ ids, action }` (`publish | unpublish | archive | feature | unfeature`) and returns `{ action, updated, failed: [{ id, message, errors? }] }`.

**Media flow.** 1) `POST /uploads/presign` `{ destinationId, filename, contentType, sizeBytes }` returns `{ key, uploadUrl, publicUrl, expiresIn }`; the server chooses the key, allows `image/jpeg|png|webp|avif` (max 10 MB) and `video/mp4|webm` (max 50 MB), and signs type and length into the URL. 2) The browser `PUT`s the file to `uploadUrl` with the same `Content-Type`. 3) `POST /destinations/:id/images` `{ key, alt }` runs an R2 `HEAD` to confirm the object exists and is an allowed image (stores the real type and size); the first image becomes the cover (max 20 per trip). Exactly one cover is kept at all times. Video: `PUT /destinations/:id/video` with `{ youtubeUrl }` (watch, youtu.be, embed, shorts; normalised to the embed URL, other hosts rejected) or `{ key }` of an uploaded mp4/webm. Responses return the full updated destination.

**Enquiries.** Statuses `NEW | CONTACTED | CLOSED` with internal `adminNotes`. The list returns `counts` per status for the filter tabs. `export.csv` honours the same filters; cells starting with `= + - @` (or tab/CR) are prefixed with `'` so spreadsheets cannot run them as formulas.

**Users and moderation.** Blocking a user (never yourself or another admin) revokes all their sessions; they get `403 ACCOUNT_BLOCKED` on login, refresh and every authenticated route. Hidden reviews vanish from the public list, counts, rating breakdown and the trip's average, in the same transaction as the change.

**Public API visibility.** Drafts, archived trips and hidden reviews never appear in the public API (lists, detail, related, reviews, wishlist).

## Deploying on a free Node host

The server is stateless, reads `PORT`, sets `trust proxy`, and exposes `/health`. Build command: `npm install --include=dev && npm run build`; start command: `npm start`. Set the environment variables from `.env.example` (production values), apply the migrations to Turso as above, then run the seed scripts once.
