# 15. Deployment

Three deployables: the **API** (a Node process), the **public website** and the **admin panel** (both are static files after `npm run build`). Pick a layout below.

## Layout A: everything in Docker on one machine (local or a small VPS)

`docker-compose.yml` at the repo root starts three containers.

| Service | Image | Port | Notes |
|---|---|---|---|
| `server` | `./server` (Node 24 slim + OpenSSL) | `${API_PORT:-5001}` → 5001 | Runs `prisma migrate deploy`, optional seed, then the API. Health check on `/health` every 15 s. Data in the volume `varanasitrails-data` (`/data/varanasitrails.db`) |
| `client` | `./client` (build with Node, serve with nginx 1.27) | `${SITE_PORT:-8080}` → 80 | nginx proxies `/api/` to `http://server:5001` |
| `admin` | `./admin` (same pattern) | `${ADMIN_PORT:-8081}` → 80 | Same proxy; adds `X-Robots-Tag: noindex, nofollow`. Build arg `VITE_PUBLIC_SITE_URL` |

```bash
cp .env.docker.example .env      # optional: ADMIN_EMAIL, ADMIN_PASSWORD, R2_*
docker compose up --build
```

`client` and `admin` wait for the API's health check (`depends_on: condition: service_healthy`). The compose file runs the API with `NODE_ENV=development`, which prints OTP emails to the log; **do not use it as-is on the public internet** (use real Brevo credentials, `NODE_ENV=production` and real secrets, and put a TLS-terminating proxy in front).

There is also `server/docker-compose.yml`, which runs **only the API** with `env_file: .env.docker` (copy `server/.env.docker.example`).

The server image's entrypoint (`server/docker-entrypoint.sh`):

```sh
npx prisma migrate deploy                         # bring the schema up to date
[ "$SEED_ON_START" = "true" ] && npx tsx src/scripts/seedDestinations.ts
exec node dist/server.js                          # also creates/updates the admin from ADMIN_*
```

(The Dockerfile strips Windows CRLF line endings from the entrypoint; a Windows checkout with CRLF would otherwise break the script.)

## Layout B: recommended production split

```
https://app.example.com    public website   (static host, e.g. Cloudflare Pages)
https://admin.example.com  admin panel      (static host, behind Cloudflare Access)
https://api.example.com    API              (Node host, e.g. Render / Railway / Fly)
                           database         Turso (libSQL)
                           files            Cloudflare R2 (public bucket / media.example.com)
                           email            Brevo
```

Putting the three on **subdomains of one registrable domain** lets the refresh cookie work with `SameSite=Lax`, which keeps CSRF protection intact.

### 1. Database (Turso)

```bash
turso db create varanasitrails
turso db show varanasitrails --url          # → TURSO_DATABASE_URL
turso db tokens create varanasitrails       # → TURSO_AUTH_TOKEN
cd server
for f in prisma/migrations/*/migration.sql; do turso db shell varanasitrails < "$f"; done
```

Details and later-migration procedures: [Database](04-database.md#turso-production). Seed once by running `npm run seed:destinations` with the Turso variables exported.

### 2. Media (R2)

1. Create a bucket; enable public access or attach a custom domain such as `media.example.com`.
2. Create an API token with Object Read and Write on the bucket.
3. Add the bucket **CORS policy** allowing the admin origin ([Media](11-api-admin-media.md#bucket-cors)).
4. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` on the API.

### 3. Email (Brevo)

Create a transactional API key and verify the sender address. Set `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (and optionally `BREVO_SENDER_NAME`, `ENQUIRY_NOTIFY_EMAIL`). Both Brevo variables are **required** when `NODE_ENV=production`.

### 4. API on a Node host

The server is stateless, reads `PORT`, sets `trust proxy` and exposes `/health`.

| Setting | Value |
|---|---|
| Root directory | `server` |
| Build command | `npm install --include=dev && npm run build` (runs `prisma generate` then `tsc`) |
| Start command | `npm start` (`node dist/server.js`) |
| Health check path | `/health` |

Environment (production values): see the [checklist](03-environment-variables.md#production-checklist). Key ones for this layout:

```
NODE_ENV=production
PORT=<host provides it>
TURSO_DATABASE_URL=libsql://…
TURSO_AUTH_TOKEN=…
JWT_SECRET=<48 random bytes>      OTP_SECRET=<48 random bytes>
CORS_ORIGIN=https://app.example.com,https://admin.example.com
COOKIE_DOMAIN=.example.com
COOKIE_SAMESITE=lax
TRUST_PROXY_HOPS=1                # use 2 if Cloudflare proxies api.example.com in front of the host
ADMIN_EMAIL=…  ADMIN_PASSWORD=…
BREVO_API_KEY=…  BREVO_SENDER_EMAIL=…
R2_…=…
```

A wrong `TRUST_PROXY_HOPS` makes every visitor look like the proxy's IP, so the rate limits would block everybody at once, or let everyone through.

### 5. Public website on Cloudflare Pages (or any static host)

| Setting | Value |
|---|---|
| Root directory | `client` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable (build time) | `VITE_API_URL=https://api.example.com/api` |

Add a single-page-app fallback so deep links work (a file `client/public/_redirects` containing `/* /index.html 200`, as the admin panel already has, or the host's equivalent setting). Do **not** set `VITE_USE_MOCKS=true` in production.

### 6. Admin panel on Cloudflare Pages

| Setting | Value |
|---|---|
| Root directory | `admin` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables (build time) | `VITE_API_URL=https://api.example.com/api`, `VITE_PUBLIC_SITE_URL=https://app.example.com` |

`admin/public/_redirects` (`/* /index.html 200`) is already included for the SPA fallback.

### Protect the admin domain

The login is the main defence, but put a second gate in front of the whole admin site. In Cloudflare Zero Trust: **Access, Applications, Add an application, Self-hosted**, set the domain to `admin.example.com` and add a policy allowing only your team's email addresses. Visitors then pass a one-time-code or SSO check before they even see the login page. **Do not** put the API's domain behind Access (the public website needs it); the API enforces admin roles itself.

### Different registrable domains

If the website, admin and API cannot share a parent domain, set `COOKIE_SAMESITE=none` (the cookie becomes `Secure`, HTTPS only) and list every origin in `CORS_ORIGIN`. This weakens CSRF protection compared with `Lax`, so prefer subdomains.

## Release checklist

- [ ] `npm run typecheck` and `npm test` pass in `server`, `client`, `admin` (or run from the repo root: `npm run typecheck && npm test`)
- [ ] New migrations applied to Turso **before** deploying code that needs them
- [ ] API deployed and `/health` returns `{"status":"ok"}`
- [ ] `ADMIN_EMAIL` / `ADMIN_PASSWORD` set; admin can log in
- [ ] Bucket CORS includes the admin origin; a test photo uploads and displays
- [ ] Sign up with a real email and receive the OTP
- [ ] `VITE_API_URL` / `VITE_PUBLIC_SITE_URL` correct in both web builds (they are compile-time)
- [ ] Replace placeholders in `client/src/data/`: phone, WhatsApp number, `siteUrl`, contact email, address, social links, home page and About copy, legal text
- [ ] Cloudflare Access (or equivalent) in front of the admin domain

## Backups and operations

- **Turso:** `turso db shell varanasitrails .dump > backup.sql`.
- **Docker volume:** back up `varanasitrails-data` (the SQLite file).
- **R2:** objects are referenced by key from the database; keep bucket and database backups in step.
- **Logs:** the API logs one line per request (method, path, status, ms, IP), warnings for 4xx and errors for 5xx; unhandled rejections are logged; an uncaught exception exits the process (let the host restart it).
- **Graceful shutdown:** on `SIGTERM` / `SIGINT` the server stops accepting connections, closes the database and exits (forced exit after 10 s).
- **Startup self-check:** the server runs `SELECT 1` against the database and exits with a clear message if it cannot connect.
