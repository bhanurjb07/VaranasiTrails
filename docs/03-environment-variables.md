# 3. Environment variables

Each app reads its own `.env` file (never committed: `.env` is in `.gitignore`). Copy the matching `.env.example` and edit it.

- Server variables are **validated with zod at startup**. If anything is wrong the server refuses to boot and prints a readable list of problems (see `server/src/config/env.ts`).
- Browser apps read variables only through `src/lib/env.ts`. Only names starting with `VITE_` reach the browser, and they are **baked in at build time**, so rebuild after changing them in production. In dev, restart `npm run dev` after editing `.env`.

## Server (`server/.env`)

### Runtime

| Variable | Required | Default | Validation | Purpose |
|---|---|---|---|---|
| `NODE_ENV` | no | **`production`** | `development` \| `production` \| `test` | A missing value is treated as production so dev behaviour is never enabled by accident. In `development`, OTP emails are printed to the console when Brevo is not configured, and the refresh cookie is not forced to `Secure`. |
| `PORT` | no | `5001` | positive integer | HTTP port. The web apps' dev proxies must point here. |
| `TRUST_PROXY_HOPS` | no | `1` | integer 0 to 5 | Number of reverse proxies in front of the server (Express `trust proxy`). `1` for a host like Render/Railway/Fly; **`2`** when Cloudflare proxies the API in front of the host. A wrong value breaks client IPs and therefore rate limiting. |

### Database

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | one of the two | none | Local SQLite file, for example `file:./dev.db` (relative to `server/`). |
| `TURSO_DATABASE_URL` | one of the two | none | Production libSQL URL, for example `libsql://your-db-your-org.turso.io`. **Wins over `DATABASE_URL` when both are set.** |
| `TURSO_AUTH_TOKEN` | required with `TURSO_DATABASE_URL` | none | Turso auth token. |

At least one of `DATABASE_URL` / `TURSO_DATABASE_URL` is required. `prisma migrate` only works with a file URL (it reads `DATABASE_URL` through `prisma.config.ts`); see [Database](04-database.md#migrations) for Turso.

### Authentication

| Variable | Required | Default | Validation | Purpose |
|---|---|---|---|---|
| `JWT_SECRET` | yes | none | 32+ characters | Signs 15-minute access tokens (HS256). |
| `OTP_SECRET` | yes | none | 32+ characters | Keys the HMAC that hashes OTP codes and password-reset tokens. |
| `BCRYPT_ROUNDS` | no | `12` | integer 4 to 15 | Password hashing cost. Tests use 4; keep 12 in production. |

> Changing `JWT_SECRET` invalidates every access token immediately. Changing `OTP_SECRET` invalidates every pending OTP and reset token. Neither signs users out of their 30-day refresh sessions.

### CORS and cookies

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `CORS_ORIGIN` | no | `http://localhost:5173,http://localhost:5174` | Comma-separated list of every origin allowed to call the API with cookies. **Must contain both the public site and the admin panel.** Example: `https://app.example.com,https://admin.example.com`. |
| `COOKIE_DOMAIN` | no | unset | Parent domain for the refresh cookie, for example `.example.com`, so `app.`, `admin.` and `api.` subdomains share one session. Leave empty on localhost. |
| `COOKIE_SAMESITE` | no | `lax` | `lax` or `none`. `none` is only for different registrable domains and **forces the `Secure` flag**. |

### Email (Brevo)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `BREVO_API_KEY` | **required when `NODE_ENV=production`** | none | Brevo transactional email API key. |
| `BREVO_SENDER_EMAIL` | **required in production** | none | Verified sender address (must be a valid email). |
| `BREVO_SENDER_NAME` | no | `VaranasiTrails` | Sender display name. |
| `ENQUIRY_NOTIFY_EMAIL` | no | none | If set, every new enquiry is also emailed here. A mail failure is logged but never fails the request. |

Without Brevo in `development`, emails are logged to the console. Without Brevo in any other mode, sending throws and the API returns `502 EMAIL_SEND_FAILED`.

### Media (Cloudflare R2)

All five are required (any non-empty dummy value lets the server start locally).

| Variable | Validation | Purpose |
|---|---|---|
| `R2_ACCOUNT_ID` | non-empty | Cloudflare account id. The S3 endpoint is `https://<id>.r2.cloudflarestorage.com`. |
| `R2_ACCESS_KEY_ID` | non-empty | R2 API token key id. |
| `R2_SECRET_ACCESS_KEY` | non-empty | R2 API token secret. The token needs Object Read and Write on the bucket. |
| `R2_BUCKET` | non-empty | Bucket name. |
| `R2_PUBLIC_BASE_URL` | valid URL | Public base URL of the bucket or its custom domain (for example `https://media.example.com`). The API builds every image URL from it. |

### Bootstrap admin

| Variable | Required | Default | Validation | Purpose |
|---|---|---|---|---|
| `ADMIN_EMAIL` | no | none | valid email | Admin login email. |
| `ADMIN_PASSWORD` | no | none | 8 to 72 bytes, letter, number **and** 10+ characters with both upper and lower case | Admin password. |
| `ADMIN_NAME` | no | `Admin` | 2 to 80 chars | Display name. |
| `ADMIN_PHONE` | no | generated | Indian mobile | Phone for the account. A stable, valid-looking placeholder is derived from the email when omitted. |

`ADMIN_EMAIL` and `ADMIN_PASSWORD` must be provided **together** or neither. See [Getting started](02-getting-started.md#the-first-admin-account).

### Reserved (unused)

`STRIPE_SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` are accepted but optional and not used by any code. They exist for future payments.

### Fixed values (not configurable)

| Value | Where |
|---|---|
| Access token lifetime 15 minutes | `config.accessTokenTtl` |
| Refresh token / cookie lifetime 30 days | `config.refreshTokenTtlMs` |
| OTP lifetime 10 minutes, 5 attempts, 60 s resend cooldown, 5 sends per hour | `services/auth/otp.service.ts` |
| Reset-token lifetime 10 minutes | `services/auth/otp.service.ts` |
| Presigned upload URL lifetime 600 s | `services/admin/destinationMedia.service.ts` |
| JSON body limit 100 kb | `app.ts` |

## Public website (`client/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `/api` | API base URL **including `/api`**. In dev leave `/api` (the Vite proxy forwards it). In production use the API's full URL, for example `https://api.example.com/api`, on the same site as the website so the cookie is sent. A trailing slash is removed. |
| `VITE_USE_MOCKS` | `false` | The exact string `true` serves all data from `client/src/mocks/` instead of the network. Anything else (including unset) uses the real API. |
| `VITE_DEV_PROXY_TARGET` | `http://localhost:5001` | **Dev only** (read by `vite.config.ts`). Where the dev server forwards `/api`. Set it to the API's actual `PORT`. |

## Admin panel (`admin/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `/api` | API base URL including `/api`. Production example: `https://api.example.com/api`. |
| `VITE_PUBLIC_SITE_URL` | `http://localhost:5173` | The public website, used by the "Open public site" and "View on public site" links. A trailing slash is removed. |
| `VITE_DEV_PROXY_TARGET` | `http://localhost:5001` | **Dev only.** Where the dev server forwards `/api`. |

The admin dev server listens on port **5174** (set in `admin/vite.config.ts`).

## Docker Compose (root `.env`, all optional)

Copy `.env.docker.example` to `.env`. These are substituted into `docker-compose.yml`.

| Variable | Default | Purpose |
|---|---|---|
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | empty / empty / `Site Admin` | Bootstrap admin (see above). Without them there is no admin, but the public site works. |
| `SITE_PORT` | `8080` | Host port for the public website. |
| `ADMIN_PORT` | `8081` | Host port for the admin panel. |
| `API_PORT` | `5001` | Host port for the API. |
| `SEED_ON_START` | `true` | Run the sample-data seed on every start. |
| `JWT_SECRET`, `OTP_SECRET` | local-only placeholders | Override for anything beyond local use. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` | placeholders | Needed only for real photo uploads and real image URLs. |

Fixed inside the compose file: `NODE_ENV=development`, `PORT=5001`, `DATABASE_URL=file:/data/varanasitrails.db`, `TRUST_PROXY_HOPS=1`, `CORS_ORIGIN=http://localhost:8080,http://localhost:8081`.

## Test environment

Defined in `server/tests/testEnv.ts` (you do not set these yourself): `NODE_ENV=test`, a throwaway SQLite file in the OS temp folder, fixed test secrets, `BCRYPT_ROUNDS=4`, `ENQUIRY_NOTIFY_EMAIL=owner@example.com`, dummy R2 values with `R2_PUBLIC_BASE_URL=https://media.test`. Rate limits are skipped when `NODE_ENV=test`.

## Production checklist

- [ ] `NODE_ENV=production` (or unset, since that is the default)
- [ ] Strong, unique `JWT_SECRET` and `OTP_SECRET` (48+ random bytes)
- [ ] `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`
- [ ] `BREVO_API_KEY` and `BREVO_SENDER_EMAIL`
- [ ] Real `R2_*` values and bucket CORS allowing the admin origin ([Media](11-api-admin-media.md#bucket-cors))
- [ ] `CORS_ORIGIN` lists both the website and admin origins
- [ ] `COOKIE_DOMAIN=.yourdomain.com` and `COOKIE_SAMESITE=lax` when using `app.` / `admin.` / `api.` subdomains
- [ ] Correct `TRUST_PROXY_HOPS` (1 or 2)
- [ ] `ADMIN_EMAIL` / `ADMIN_PASSWORD` set so an admin exists (the account is re-checked on every start; changing the password variable rotates the password)
- [ ] `VITE_API_URL` and `VITE_PUBLIC_SITE_URL` set at **build** time for both web apps
