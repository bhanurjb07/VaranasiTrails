# 2. Getting started

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 24 (the Docker images use `node:24-slim`) | A recent LTS may work, but 24 is what the project is built and tested with |
| npm | bundled with Node | Each app has its own `package-lock.json` |
| Docker Desktop | optional | Only for the one-command setup |
| Turso CLI | optional | Only for production databases |
| Cloudflare R2 bucket | optional locally | Only needed for real photo uploads. The server starts with dummy R2 values. |

## Option A: run each app locally (no Docker)

Each folder uses its own `.env` file. The API's `PORT` in `server/.env` decides where the two web apps' dev proxies must point (`VITE_DEV_PROXY_TARGET`).

### 1. Server

```bash
cd server
npm install
cp .env.example .env            # then edit it (see below)
npx prisma generate
npx prisma migrate deploy       # creates ./dev.db from prisma/migrations
npm run seed:destinations       # 9 categories + 7 sample trips (safe to re-run)
npm run dev                     # http://localhost:5001 (or your PORT)
```

Minimum `.env` for local development (the example file already has these):

```
NODE_ENV=development
PORT=5001
DATABASE_URL=file:./dev.db
JWT_SECRET=<at least 32 characters>
OTP_SECRET=<at least 32 characters>
R2_ACCOUNT_ID=local
R2_ACCESS_KEY_ID=local
R2_SECRET_ACCESS_KEY=local
R2_BUCKET=local
R2_PUBLIC_BASE_URL=https://media.example.com
```

Generate strong secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

> `NODE_ENV` **defaults to `production`** when unset. In `development` with no `BREVO_API_KEY`, OTP emails are printed to the server console instead of being sent.

Check it works:

```bash
curl http://localhost:5001/health
# {"status":"ok"}
curl "http://localhost:5001/api/destinations?limit=2"
```

### 2. Public website

```bash
cd client
npm install
cp .env.example .env
npm run dev                     # http://localhost:5173
```

Set `VITE_DEV_PROXY_TARGET` in `client/.env` to the **same port as the API** (for example `http://localhost:5000` if `server/.env` says `PORT=5000`).

### 3. Admin panel

```bash
cd admin
npm install
cp .env.example .env
npm run dev                     # http://localhost:5174
```

Again set `VITE_DEV_PROXY_TARGET` to the API's port.

### 4. Everything with one command (from the repo root)

```bash
npm install                     # installs `concurrently` at the root
npm run dev                     # starts admin, client and server together
```

The root scripts (`dev`, `build`, `start`, `lint`, `typecheck`, `test`) simply run the matching script in `admin`, `client` and `server`. You still need to run `npm install` inside each of the three folders once.

## Option B: public website only, with mock data (no backend)

Use this to work on the website's UI without running the API.

1. In `client/.env` set `VITE_USE_MOCKS=true`.
2. **Restart** `npm run dev` (Vite only reads `.env` at startup).
3. Open `http://localhost:5173`.

What mock mode gives you:

| Item | Value |
|---|---|
| Trips | 10 sample trips with photos, itinerary, highlights, inclusions and reviews (`client/src/mocks/catalog.ts`) |
| Categories | 4 (Spiritual & Pilgrimage, Heritage & Culture, Food & Culinary, Crafts & Experiences) |
| Demo login | `demo@example.com` / `Passw0rd1` |
| Signup | Any new signup works |
| Every OTP step | Accepts the code `123456` |
| Password-reset token | `mock-reset-token` (handled automatically by the UI) |
| Persistence | Accounts and the session survive a page reload (`sessionStorage`). Wishlist, reviews and enquiries reset on reload. |

The **admin panel has no mock mode**; it always needs the real API.

If `VITE_USE_MOCKS=false` (the default) and no API is running, the site shows "Could not load trips" errors because it is calling a backend that is not there. See [Troubleshooting](17-troubleshooting.md#mock-data-is-not-visible-in-the-website).

## Option C: everything in Docker

You only need Docker Desktop.

```bash
cp .env.docker.example .env       # optional, see below
docker compose up --build
```

| What | Address |
|---|---|
| Public website | http://localhost:8080 |
| Admin panel | http://localhost:8081 |
| API | http://localhost:5001 (health check: `/health`) |

The first start builds three images (a few minutes), applies database migrations and loads the sample trips. Data is kept in the Docker volume `varanasitrails-data`, so it survives restarts.

Both web apps are served by nginx, which forwards `/api` to the API container. This keeps everything on one origin per app, so the login cookie works over plain `http`.

Useful commands:

```bash
docker compose up -d                  # start in the background
docker compose logs -f server         # follow API logs (OTP codes appear here)
docker compose down                   # stop, keep your data
docker compose down -v                # stop and DELETE the database volume
```

If a port is busy set `SITE_PORT`, `ADMIN_PORT` or `API_PORT` in the root `.env`.

In Docker the API runs with `NODE_ENV=development`, so **sign-up OTP codes are printed in the server log** (`docker compose logs -f server`) instead of being emailed.

## The first admin account

There is no admin sign-up screen. The admin is created from environment variables when the server starts.

Put these in `server/.env` (or the root `.env` for Docker):

```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=ChooseAStrongOne1
ADMIN_NAME=Site Admin        # optional
ADMIN_PHONE=9999999999       # optional (a stable placeholder is generated if omitted)
```

Rules:

- Both `ADMIN_EMAIL` and `ADMIN_PASSWORD` must be set together, or the server refuses to start.
- The password needs **10 or more characters**, with upper case, lower case, a letter and a number.
- On every server start the account is created, or promoted to `ADMIN` and unblocked if it already exists.
- Changing `ADMIN_PASSWORD` and restarting **rotates the password and signs the admin out everywhere**.
- You can also run it by hand: `npm run seed:admin` (inside `server/`).

Then log in at the admin panel (`http://localhost:5174`, or `:8081` in Docker) with that email and password. Anyone whose role is not `ADMIN` is refused with "No access" and signed straight back out. Public sign-up always creates a normal `USER`.

## Seed data

`npm run seed:destinations` (inside `server/`) is idempotent: trips are matched by slug and their child rows (highlights, itinerary, inclusions, images) are replaced.

| Seeded | Details |
|---|---|
| Categories (9) | `spiritual` (Pilgrimage), `heritage`, `food`, `crafts`, `honeymoon`, `family-tour`, `adventure`, `solo-and-group`, `day-trips` |
| Trips (7) | `ganga-aarti-boat-ride`, `kashi-vishwanath-heritage-walk`, `sarnath-buddhist-day-tour`, `varanasi-ayodhya-prayagraj-pilgrimage`, `banarasi-food-trail`, `banarasi-silk-weaving-experience`, `chunar-fort-vindhyachal-excursion` |
| Image keys | `destinations/<slug>/01.webp` etc. Upload matching files to your R2 bucket, or the website falls back to placeholder photos. |

In Docker, `SEED_ON_START=true` (the default) runs this on every start.

## Everyday commands

| Where | Command | Purpose |
|---|---|---|
| `server/` | `npm run dev` | Watch mode (tsx) |
| `server/` | `npm run build` then `npm start` | Generate Prisma client, compile to `dist/`, run |
| `server/` | `npm run typecheck` | Type check only |
| `server/` | `npm test` | vitest + supertest on a temp SQLite file (Brevo and R2 mocked) |
| `server/` | `npm run db:migrate` | Create a new migration while developing (`prisma migrate dev`) |
| `server/` | `npm run db:deploy` | Apply existing migrations |
| `server/` | `npm run db:studio` | Prisma Studio (browse the database) |
| `server/` | `npm run seed:destinations` / `seed:admin` | Seed trips / run admin bootstrap by hand |
| `client/`, `admin/` | `npm run dev` | Vite dev server |
| `client/`, `admin/` | `npm run build` | Type-check, then production build into `dist/` |
| `client/`, `admin/` | `npm run preview` | Serve the production build |
| `client/`, `admin/` | `npm run lint` / `typecheck` / `test` | oxlint / `tsc -b` / vitest |

## Next steps

- Understand the moving parts: [Architecture](01-architecture.md)
- Configure production: [Environment variables](03-environment-variables.md) and [Deployment](15-deployment.md)
- Something not working? [Troubleshooting](17-troubleshooting.md)
