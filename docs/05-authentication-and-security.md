# 5. Authentication and security

## Concepts

| Concept | Details |
|---|---|
| **Access token** | A JWT (HS256) signed with `JWT_SECRET`, valid **15 minutes**. Payload is only `{ sub: <userId>, iat, exp }`. Sent as `Authorization: Bearer <token>`. The web apps keep it **in memory only** (never in `localStorage`). |
| **Refresh token** | A random opaque string (48 random bytes, base64url) stored **hashed (SHA-256)** in `refresh_tokens`. Valid **30 days**. Delivered only as an `httpOnly` cookie. |
| **Roles** | `USER` (default for every signup) and `ADMIN`. The role is **never read from the token**; it is re-read from the database on each admin request. |
| **Pending account** | A signed-up user whose email is not yet verified (`emailVerifiedAt` is null). Cannot log in. |
| **Blocked account** | `isBlocked = true`. Gets `403 ACCOUNT_BLOCKED` on login, refresh and every authenticated request. |

## The refresh cookie

| Attribute | Value |
|---|---|
| Name | `refresh_token` |
| Path | `/api` (so it is only sent to API calls) |
| `HttpOnly` | always |
| `Secure` | always, except when `NODE_ENV=development` **and** `COOKIE_SAMESITE=lax` (plain-http local dev). Forced on when `COOKIE_SAMESITE=none`. |
| `SameSite` | `COOKIE_SAMESITE` (`lax` default, or `none`) |
| `Domain` | `COOKIE_DOMAIN` if set (for example `.example.com`), otherwise host-only |
| Max-Age | 30 days |

Browsers must call the API with `credentials: "include"` (both web apps do). The cookie is cleared with the same path and domain attributes (otherwise the browser would ignore the clear).

**Same-site requirement.** With `SameSite=Lax` the website, admin panel and API must share a registrable domain (for example `app.example.com`, `admin.example.com`, `api.example.com`). Use `COOKIE_DOMAIN=.example.com`. Different registrable domains require `COOKIE_SAMESITE=none` (always `Secure`). In local development the Vite dev proxy makes everything same-origin, and in Docker nginx does.

## Flow 1: signup and email verification

```
Browser                                   API                                   Brevo
  │ POST /auth/signup {name,phone,email,password}                                  │
  │───────────────────────────────────────►│ validate, hash password               │
  │                                        │ create (or replace) PENDING user      │
  │                                        │ create OTP row (hash only) ──────────►│ email "123456"
  │◄──────────────── 201 { message } ──────│                                       │
  │ POST /auth/verify-email {email, otp}                                           │
  │───────────────────────────────────────►│ check code, mark email verified       │
  │                                        │ create session                        │
  │◄── 200 { user, accessToken } + Set-Cookie refresh_token ────                   │
```

Pending-account rules (so nobody can squat on someone else's email or phone):

- If the email or phone belongs to a **verified** account, signup fails with `409 ACCOUNT_EXISTS` (this also applies when only the phone matches a verified account).
- If it only matches **pending** accounts, the pending account is **overwritten** with the new name, phone and password, its sessions and unused OTPs are revoked, and a fresh OTP is sent. If the email matches one pending account and the phone another, they are merged into one.
- If sending the email fails (`502 EMAIL_SEND_FAILED`) the new OTP is deleted, so the identical request can be retried immediately.
- Signup ignores the 60-second resend cooldown (it is a deliberate new submission) but still honours the 5-per-hour cap (`429 OTP_SEND_LIMIT` with `Retry-After: 3600`).

## Flow 2: login

`POST /auth/login` checks, **in this order**:

1. Account exists and password matches, otherwise `401 INVALID_CREDENTIALS` (the same error for an unknown email and a wrong password; an unknown email still burns the same CPU time as a real check, so timing does not reveal which emails exist).
2. Email verified, otherwise `403 EMAIL_NOT_VERIFIED` (only revealed after the password is correct).
3. Not blocked, otherwise `403 ACCOUNT_BLOCKED`.

On success: `lastLoginAt` is updated, a refresh token row is created, the cookie is set and `{ user, accessToken }` is returned.

## Flow 3: silent session restore and refresh

The web apps call `POST /auth/refresh` on page load (the cookie is the only credential). While running, any request that gets a `401` with code `TOKEN_INVALID` (or no code) triggers **one** shared refresh and **one** retry. Many parallel requests share a single refresh call.

Server side, `rotateSession`:

| Situation | Result |
|---|---|
| Unknown token | `401 REFRESH_INVALID` |
| Token already rotated (reuse) | All the user's sessions are revoked, `401 REFRESH_REUSED` |
| User is blocked | All sessions revoked, `403 ACCOUNT_BLOCKED` |
| Revoked or expired | `401 REFRESH_INVALID` |
| Valid | The old token is marked rotated + revoked, a **new** token is issued (cookie replaced), a new access token returned |
| Two requests race with the same token | The loser is treated as reuse (all sessions revoked) |

On any refresh error the cookie is cleared.

## Flow 4: forgot / reset password

```
POST /auth/forgot-password {email}          → generic 200 (email sent if the account exists)
POST /auth/verify-reset-otp {email, otp}    → 200 { resetToken }  (single use, 10 minutes)
POST /auth/reset-password {email, resetToken, newPassword}
                                            → 200, password changed, ALL sessions revoked
```

The `resetToken` is a random 32-byte base64url string, bound to the verified OTP row (only its HMAC is stored). `reset-password` returns the same `RESET_TOKEN_INVALID` for an unknown email and a bad token so it cannot be used to probe emails.

## Flow 5: changing your password while logged in

`POST /users/me/change-password` verifies the old password, stores the new hash and revokes **every other session** (the one belonging to the current refresh cookie stays). If the request carries no refresh cookie, all sessions are revoked.

## OTP rules

| Rule | Value |
|---|---|
| Format | 6 digits from `crypto.randomInt` (leading zeros allowed) |
| Storage | `HMAC-SHA256("<otpId>:<code>")` keyed with `OTP_SECRET`. The code is never stored. |
| Lifetime | 10 minutes |
| Use | Single use. A new OTP of the same purpose invalidates earlier unused ones. |
| Wrong guesses | Each check burns an attempt **atomically before** comparing. After **5** attempts the OTP is dead. |
| Resend cooldown | 60 seconds per purpose (silently skipped, not an error, on `resend-otp` and `forgot-password`) |
| Hourly cap | 5 sends per account per hour (counted across both purposes) |
| Comparison | Constant-time (`crypto.timingSafeEqual`) |

`resend-otp` and `forgot-password` always return the same `200` message (`"If an account exists for that email, a code has been sent"`) whether or not the account exists, whether or not a code was actually sent, so they cannot be used to enumerate accounts. Clients should run their own 60-second countdown. (The one exception: if the account exists and the mail provider fails, the response is `502 EMAIL_SEND_FAILED`.)

## Password and field rules

| Field | Rule |
|---|---|
| Email | Trimmed, lower-cased, valid email, max 254 characters |
| Phone | Indian mobile: optional `+91` then 10 digits starting 6 to 9; spaces and dashes are removed; stored as `+91XXXXXXXXXX` |
| Name | Trimmed, 2 to 80 characters |
| Password (signup, reset, change) | 8 to 72 **bytes** (bcrypt's limit), at least one letter and one number |
| Password (login) | 1 to 200 characters, checked only against the stored hash (old passwords are not re-validated against the signup rules) |
| Admin password (`ADMIN_PASSWORD`) | Above rules plus 10+ characters and both upper and lower case |

## Authorization middleware

| Middleware | Behaviour |
|---|---|
| `requireAuth` | Needs `Authorization: Bearer <jwt>`. Missing header: `401 "Missing bearer token"`. Bad/expired JWT: `401 TOKEN_INVALID`. Then loads the user: deleted: `401 TOKEN_INVALID`; blocked: `403 ACCOUNT_BLOCKED`. Sets `req.user = { sub }`. |
| `requireAdmin` | Re-reads the role from the database. Anything but `ADMIN`: `403 "Admin access required"`. |
| `requireVerifiedEmail` | Used for creating reviews. Unverified: `403 EMAIL_NOT_VERIFIED`. |

Because the blocked check happens on every authenticated request, blocking a user cuts them off **immediately** (not after the 15-minute token expiry), and blocking also revokes all their refresh tokens.

## Admin account bootstrap

The server runs `ensureAdminFromConfig()` at every start when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are both set:

| Existing account? | Result |
|---|---|
| No | Created: role `ADMIN`, email verified |
| Yes, wrong role / blocked / unverified | Promoted to `ADMIN`, unblocked, email marked verified |
| Yes, password differs from `.env` | Password re-hashed and **all sessions revoked** (`password_rotated`) |
| Yes, already correct | `unchanged` |

It logs what happened (never the password) and never stops the server on failure (for example if the phone number is already used by another account).

## Rate limits

Counted per client IP (so `TRUST_PROXY_HOPS` must be correct) and per limiter. Exceeding returns `429 { "message": "…", "code": "RATE_LIMITED" }` with standard `RateLimit` headers (IETF draft-7). All limits are disabled when `NODE_ENV=test`.

| Limiter | Applies to | Limit |
|---|---|---|
| Global | Everything, including `/health` | 300 per 15 minutes |
| Login | `POST /api/auth/login` | 10 per 15 minutes |
| Signup | `POST /api/auth/signup` | 10 per 60 minutes |
| OTP | `POST /api/auth/verify-email`, `POST /api/auth/resend-otp` | 10 per 15 minutes |
| Password reset | `POST /api/auth/forgot-password`, `verify-reset-otp`, `reset-password`, and `POST /api/users/me/change-password` | 10 per 15 minutes |
| Enquiry | `POST /api/enquiries` | 5 per 60 minutes |
| Admin | Everything under `/api/admin` | 600 per 15 minutes |

## Other protections

| Protection | Details |
|---|---|
| Security headers | `helmet()` defaults |
| CORS | Only origins in `CORS_ORIGIN`; credentials allowed |
| Body size | 100 kb JSON limit (`413 PAYLOAD_TOO_LARGE`); malformed JSON gives `400 INVALID_JSON` |
| SQL injection | All queries go through Prisma (parameterised) |
| CSV injection | Exported cells beginning with `= + - @`, tab or CR are prefixed with `'` ([Admin enquiries](12-api-admin-moderation.md#export-csv)) |
| Email HTML | User-supplied text in notification emails is HTML-escaped |
| Secrets in responses | OTPs, hashes and tokens never appear in responses. The only token returned from a reset flow is `resetToken` from `verify-reset-otp`. |
| Upload safety | Server chooses the storage key; content type and length are signed into the upload URL; the object is verified with an R2 `HEAD` before it is attached ([Media](11-api-admin-media.md)) |
| Audit trail | Every admin mutation writes an audit row in the same transaction |
| Admin domain | Recommended: put the admin site behind Cloudflare Access ([Deployment](15-deployment.md#protect-the-admin-domain)) |

## What the browser apps do with auth errors

| Code | Website behaviour | Admin behaviour |
|---|---|---|
| `TOKEN_INVALID` / no code on 401 | Refresh once, retry once | Same |
| `EMAIL_NOT_VERIFIED` (login) | Redirects to the verify-email page | Shows "not verified" notice |
| `ACCOUNT_BLOCKED` | Treated as an ordinary error message | Clears the session immediately and shows the message |
| Refresh fails | Session cleared, toast "Your session has expired. Please log in again." | Session cleared, toast "Your session has ended. Please log in again." |
| User is not `ADMIN` | n/a | Signed out server-side, shown "No access" |
