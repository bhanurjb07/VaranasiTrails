# 17. Troubleshooting

Find your symptom, then follow the fix.

## Mock data is not visible in the website

**Symptom:** you expected the sample trips to appear on the public website, but the page is empty or shows "Could not load trips".

**Cause:** the website only shows mock data when `client/.env` contains exactly `VITE_USE_MOCKS=true`. The default (and the value in `.env.example`) is `false`, which makes the site call the real API. If the API is not running, or the dev proxy points at the wrong port, the requests fail.

**Fix:**

1. Open `client/.env` and set:
   ```
   VITE_USE_MOCKS=true
   ```
2. **Stop and restart** `npm run dev` in `client/`. Vite reads `.env` only at startup; saving the file is not enough.
3. Hard-refresh the browser. You should see 10 sample trips. Log in with `demo@example.com` / `Passw0rd1`; any OTP is `123456`.

Check you edited the right file: it must be `client/.env` (next to `client/package.json`), **not** the repo root and not `.env.example`. Also confirm the value is `true` in lower-case with no quotes or spaces.

To use real data instead (`VITE_USE_MOCKS=false`) start the API and make `VITE_DEV_PROXY_TARGET` match its port (next section). Mock mode never applies to the admin panel.

## Website or admin cannot reach the API

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot reach the server` / network errors / `ECONNREFUSED` in the Vite terminal | API not running, or the **dev proxy points at the wrong port** | Start `server` (`npm run dev`). Make `VITE_DEV_PROXY_TARGET` in `client/.env` and `admin/.env` equal to the API's `PORT` from `server/.env` (for example `http://localhost:5000` if `PORT=5000`). Restart the Vite dev servers |
| Works with `curl`, fails in the browser with a CORS error | The browser origin is not in `CORS_ORIGIN` | Add it, for example `CORS_ORIGIN=http://localhost:5173,http://localhost:5174`, and restart the API |
| Everything returns HTML instead of JSON | `VITE_API_URL` is wrong (missing `/api`), or the SPA fallback is answering API paths | `VITE_API_URL` must end in `/api` (default `/api`) |
| `404 Route not found: GET /api/...` | Wrong path, or an old API build | Check the path against the endpoint pages |
| Docker: API container unhealthy | Bad environment (the server exits with a validation list) | `docker compose logs server` |

## The server will not start

The server validates its environment and prints a list such as:

```
Invalid environment configuration:
  - JWT_SECRET: JWT_SECRET must be at least 32 characters
  - DATABASE_URL: Set DATABASE_URL (file:./dev.db) or TURSO_DATABASE_URL
```

Fix every listed item. Common ones: secrets shorter than 32 characters; missing `R2_*` (dummy values are fine locally); `ADMIN_EMAIL` without `ADMIN_PASSWORD` (or vice versa); in production a missing `BREVO_API_KEY` / `BREVO_SENDER_EMAIL`; `TURSO_DATABASE_URL` without `TURSO_AUTH_TOKEN`.

`NODE_ENV` defaults to **production**. If you forgot to set `NODE_ENV=development` locally, Brevo becomes mandatory.

`Could not connect to the database`: check `DATABASE_URL` (a relative `file:./dev.db` is relative to `server/`) or the Turso URL/token. Run `npx prisma migrate deploy` once for a new local database.

## Login and session problems

| Symptom | Cause | Fix |
|---|---|---|
| Logged out on every page reload | The refresh cookie is not being stored or sent | Use the Vite proxy (`VITE_API_URL=/api`) in dev. In production the website, admin and API must be same-site (subdomains) with `COOKIE_DOMAIN=.example.com`, `COOKIE_SAMESITE=lax`, HTTPS, and the browser calls must use credentials |
| Cookie never set in production | `Secure` cookie over plain http, or `CORS_ORIGIN` missing the origin | Serve over HTTPS; add the origin; check `COOKIE_SAMESITE` |
| Everyone gets `429 RATE_LIMITED` quickly | `TRUST_PROXY_HOPS` wrong, so all users share the proxy's IP | Set it to 1 (one proxy) or 2 (Cloudflare + host) |
| `EMAIL_NOT_VERIFIED` at login | Signup was never confirmed | Use the verify-email page ("Resend" sends a new code) |
| No OTP email arrives | In `development` without Brevo the code is **printed in the server console** (`docker compose logs -f server` in Docker). In production Brevo must be configured and the sender verified | Check the log; set Brevo variables |
| `502 EMAIL_SEND_FAILED` | Brevo rejected or is unreachable | Check the API key, sender, and the server log line `[mailer] Brevo responded …` |
| `403 ACCOUNT_BLOCKED` | An admin blocked the account | Admin panel → Users → Unblock (then log in again) |
| `401 REFRESH_REUSED`, logged out everywhere | An old refresh token was used again (two tabs racing, or a stolen cookie) | Log in again |
| Admin login says "No access" | The account's role is not `ADMIN` | Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` to that account and restart the API (it promotes the account) |
| Admin password changed in `.env` but old one still works | The API was not restarted | Restart; the new value rotates the password and signs the admin out everywhere |
| `Invalid or expired code` repeatedly | Code expired (10 min), already used, a newer code replaced it, or 5 wrong tries | Request a new code and use the **latest** email |

## Photos and media

| Symptom | Fix |
|---|---|
| Photo upload fails with a CORS error in the browser console | Add the admin origin to the R2 bucket CORS policy ([Media](11-api-admin-media.md#bucket-cors)) |
| `UPLOAD_MISSING` after uploading | The `PUT` to R2 failed, or the R2 credentials/bucket in `.env` are wrong |
| `SignatureDoesNotMatch` | The `Content-Type` or length of the `PUT` differs from what was presigned, or the URL expired (10 min) |
| Images upload but show a placeholder photo | `R2_PUBLIC_BASE_URL` is wrong or the bucket is not public. The website falls back to a placeholder photo for any image that fails to load |
| Sample trips show placeholder photos | The seeded keys (`destinations/<slug>/01.webp` …) do not exist in your bucket. Upload files with those keys or replace the images through the admin panel |
| Local dev with dummy R2 values | Real uploads cannot work without a real bucket |

## Admin panel

| Symptom | Fix |
|---|---|
| Cannot publish a trip | Look at the checklist on the right (or the `readiness.errors` in the API response) and complete every item |
| `409 ARCHIVED` when saving or uploading | The trip is archived. Restore it first |
| `Archive this trip first` when deleting | Permanent delete only works on archived trips |
| Cannot delete a category | It still has trips (`CATEGORY_IN_USE`). Move the trips or switch the category off instead |
| Photo count limit | At most 20 photos per trip |
| CSV shows `'=...` in cells | Intentional: it prevents spreadsheet formula injection |
| The page reloads once the first time you open a screen in dev | Vite's dependency optimiser; does not happen in production builds |

## Database and migrations

| Symptom | Fix |
|---|---|
| `no such table` | Run `npx prisma migrate deploy` in `server/` |
| `prisma migrate` fails against Turso | Expected: Turso migrations are applied with the Turso CLI ([Database](04-database.md#turso-production)) |
| Schema changed but Prisma types are stale | `npx prisma generate` (or `npm run build`) |
| Wipe the local database | Delete `server/dev.db` and run `npx prisma migrate deploy && npm run seed:destinations`. In Docker: `docker compose down -v` |

## Windows notes

- Docker builds can fail if `docker-entrypoint.sh` has CRLF line endings. The Dockerfile already strips them, and `.gitattributes` (`*.sh text eol=lf`) keeps shell scripts on LF when they are checked out.
- Server tests use a single HTTP server per file because many short-lived servers crashed the worker on Windows (exit code `3221226505`).
- Use `cp` equivalents in PowerShell: `Copy-Item .env.example .env`.

## Known limitations (by design or open items)

- **No booking or payment.** Bookings happen on WhatsApp; `STRIPE_*` / `RAZORPAY_*` are reserved and unused.
- **Review ownership:** the API does not tell the website which review is the viewer's own; the website remembers ids it created in `localStorage` (`vt_my_reviews`). Clearing browser storage hides the Edit/Delete shortcut for old reviews.
- **Website and `ACCOUNT_BLOCKED`:** the public website's API client does not treat a blocked account specially (the admin panel does); the user just sees the error message.
- **Placeholder content:** the phone and WhatsApp numbers, site URL and contact details in `client/src/data/` are sample values until replaced, and the home/About copy is marked `TODO(business)` for review.
- **Admin panel has no mock mode** and needs a running API.
