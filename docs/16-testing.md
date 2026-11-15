# 16. Testing

All three apps use **vitest**. From the repo root, `npm test` runs admin, client and server in turn (`npm run typecheck` and `npm run lint` work the same way).

## Server (`server/tests/`)

```bash
cd server
npm test            # vitest run
```

### How it is set up

| Piece | What it does |
|---|---|
| `tests/testEnv.ts` | Fixed test environment: `NODE_ENV=test`, test secrets, `BCRYPT_ROUNDS=4`, dummy R2 values (`R2_PUBLIC_BASE_URL=https://media.test`), `ENQUIRY_NOTIFY_EMAIL=owner@example.com`, and a **throwaway SQLite file in the OS temp folder** (`varanasitrails-test-<uuid>.db`) |
| `tests/globalSetup.ts` | Runs `npx prisma migrate deploy` against that temp database, so tests use the **real migrations**. Deletes the file (and `-journal`, `-wal`, `-shm`) afterwards |
| `tests/setup.ts` | Mocks `lib/mailer.js` (every email is captured, Brevo is never called) and `lib/r2.js` (`publicUrl` is real-looking, `createUploadUrl` returns a fake URL, `headObject` returns `null` until a test says a file exists, `deleteObject` is a no-op). Starts one long-lived HTTP server per test file |
| `tests/httpServer.ts` | One shared `http.Server` per file. (supertest creates a server for every request when given the bare Express app, and thousands of them crashed the worker on Windows) |
| `tests/helpers.ts` | `api()` (supertest client), `PASSWORD`, `uniqueUser()`, `resetDatabase()`, `lastCodeFor(email)` (reads the OTP out of the captured email), `emailsTo(email)` |
| `vitest.config.ts` | `fileParallelism: false` (all files share one SQLite file), 20 s test timeout, 60 s hook timeout |

Rate limiters are disabled when `NODE_ENV=test`. The suite exercises the **full HTTP stack** (routes, middleware, validation, services, database) with supertest.

### Files and what they cover (about 150 test cases)

| File | Covers |
|---|---|
| `auth.test.ts` | signup → verify → login; OTP rules (expiry, attempts, cooldown, hourly cap, invalidation); forgot → verify → reset password; refresh-token rotation and reuse detection |
| `authFixes.test.ts` | Pending accounts are replaced (no email/phone squatting) and merged; signup retry when the OTP email fails; blocked users; configuration parsing |
| `adminAccount.test.ts` | `ensureAdmin` (created, promoted, password rotated, unchanged) and `ensureAdminFromConfig` (never throws, never logs the password) |
| `adminAccess.test.ts` | Admin routes require an admin; 401/403 cases; role changes take effect immediately |
| `adminCatalog.test.ts` | Categories (CRUD, reorder, in-use rule, slug stability, images); destinations create/edit, publish readiness rules, duplicate, archive, restore, delete, bulk |
| `adminMedia.test.ts` | Presign validation; attaching images with `HEAD` verification; cover logic, reorder, delete with shared-file safety; video (YouTube and upload); `parseYouTubeUrl` |
| `adminModeration.test.ts` | Enquiries (filters, status, notes, delete, CSV export and formula escaping); users (list, detail, block rules); reviews (hide/unhide/delete and rating recompute); dashboard; audit log |
| `destinations.test.ts` | Public list filters/sorting/paging, detail (related, rating breakdown), categories |
| `engagement.test.ts` | Reviews (create, one per user, edit, delete, rating recompute), wishlist (idempotent), user profile and password change, enquiries |
| `publicVisibility.test.ts` | Drafts, archived trips, hidden reviews and inactive categories never appear in the public API |

### Run a subset

```bash
npx vitest run tests/auth.test.ts
npx vitest run -t "refresh tokens"
```

### Type check

```bash
npm run typecheck      # tsc --noEmit
```

## Public website (`client/`)

```bash
cd client
npm test               # vitest run (jsdom)
```

Config lives in `vite.config.ts`: environment `jsdom`, setup `src/test/setup.ts` (jest-dom matchers + automatic cleanup), tests in `src/**/*.test.{ts,tsx}`, CSS disabled.

| Test file | Covers |
|---|---|
| `lib/apiClient.test.ts` | The refresh-and-retry logic: one shared refresh for parallel requests, retry once, no refresh loop on auth paths, session cleared on failure |
| `lib/format.test.ts` | `formatPrice` (en-IN grouping), durations, ratings, dates, difficulty labels, phone formatting |
| `lib/whatsapp.test.ts` | Template filling; sentences with missing tokens are dropped; URL encoding |
| `features/auth/components/OtpInput.test.tsx` | The 6-box code input: typing, auto-advance, backspace, paste |
| `features/auth/accountUi.test.tsx` | The mobile menu's account block (greeting, See all, Switch account, Sign out, visitor links) and the profile page (forms hidden until asked, one open at a time) |

## Admin panel (`admin/`)

```bash
cd admin
npm test
```

| Test file | Covers |
|---|---|
| `lib/apiClient.test.ts` | Refresh and retry; `ACCOUNT_BLOCKED` handling |
| `lib/csv.test.ts` | Formula-safe CSV cells, quoting, `toCsv` |
| `lib/imageCompress.test.ts` | `fitWithin` (never upscales) and the quality/size search `compressToTarget` |
| `lib/youtube.test.ts` | YouTube link parsing (watch, youtu.be, embed, shorts; rejects other hosts) |
| `features/destinations/editor/readiness.test.tsx` | The publish checklist mirrors the server rules; the checklist component links missing items to sections; the editor form schema and the form-to-API payload conversion (bad slug, missing category, discount rule) |

## Manual smoke test (after a deploy)

1. `GET /health` returns `{"status":"ok"}`.
2. Public site: the home page lists featured trips; open a trip; filters work.
3. Sign up with a real email, receive the code, verify, and see yourself logged in.
4. Add a trip to the wishlist, write a review, send an enquiry.
5. Admin: log in; the dashboard counts look right; create a draft, upload a photo, fill the checklist, publish; the trip appears on the public site.
6. Admin: the enquiry from step 4 shows up as `NEW`; change its status; export CSV.
7. Admin: hide your review; the trip's rating updates on the public page.
