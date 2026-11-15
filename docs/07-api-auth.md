# 7. API: Auth and Users

Base path: `/api`. General rules (error format, pagination, headers) are in [API conventions](06-api-conventions.md). Concepts (OTP, tokens, cookies) are in [Authentication and security](05-authentication-and-security.md).

## The `user` object

Returned by every auth endpoint and by `/users/me`:

```json
{
  "id": "5b0c1d9e-4c0a-4d3e-9a52-7d1f0a6c2e11",
  "name": "Asha Verma",
  "email": "asha@example.com",
  "phone": "+919876543210",
  "role": "USER",
  "emailVerified": true,
  "createdAt": "2026-11-05T18:40:12.000Z"
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | UUID |
| `name` | string | |
| `email` | string | Lower-case |
| `phone` | string | `+91` + 10 digits |
| `role` | `"USER"` \| `"ADMIN"` | |
| `emailVerified` | boolean | `emailVerifiedAt !== null` |
| `createdAt` | string | ISO datetime |

The password hash, block flag and last login are **never** included here.

## The `session` response

Several endpoints return a session. The body is `{ user, accessToken }` and the response also carries `Set-Cookie: refresh_token=…; HttpOnly; Path=/api; Max-Age=2592000; SameSite=Lax` (plus `Secure` / `Domain` as configured).

```json
{ "user": { "…": "see above" }, "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…" }
```

---

## POST `/api/auth/signup`

Creates (or replaces) a **pending** account and emails a 6-digit code. Does not log the user in.

- **Auth:** none
- **Rate limit:** signup limiter (10 / 60 min / IP) plus global

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | yes | Trimmed, 2 to 80 chars |
| `phone` | string | yes | Indian mobile: optional `+91`, then 10 digits starting 6 to 9. Spaces and dashes are removed. Stored as `+91XXXXXXXXXX` |
| `email` | string | yes | Trimmed, lower-cased, valid email, max 254 |
| `password` | string | yes | 8 to 72 bytes, at least one letter and one number |

```http
POST /api/auth/signup
Content-Type: application/json

{ "name": "Asha Verma", "phone": "98765 43210", "email": "Asha@Example.com", "password": "Passw0rdOK" }
```

### Success: `201 Created`

```json
{ "message": "Account created. We emailed you a 6-digit code to verify your email." }
```

### Errors

| Status | `code` | When |
|---|---|---|
| 409 | `ACCOUNT_EXISTS` | The email **or** the phone belongs to an account whose email is already verified |
| 422 | `VALIDATION_ERROR` | Any field fails its rule |
| 429 | `OTP_SEND_LIMIT` | 5 verification emails already sent to this account in the last hour (`Retry-After: 3600`) |
| 429 | `RATE_LIMITED` | More than 10 signups per hour from this IP |
| 502 | `EMAIL_SEND_FAILED` | Brevo failed or is not configured. The OTP is rolled back; the same request can be retried immediately |

### Behaviour notes

- Signing up again with an email or phone that belongs to a **pending** account overwrites that account (name, phone, password) and sends a new code; earlier codes and sessions of that pending account are revoked.
- Signup always creates `role: "USER"`.
- The 60-second resend cooldown does not apply to signup.

---

## POST `/api/auth/verify-email`

Confirms the code from the signup email, marks the email verified and **logs the user in**.

- **Auth:** none
- **Rate limit:** OTP limiter (10 / 15 min / IP)

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | yes | Valid email (lower-cased) |
| `otp` | string | yes | Exactly 6 digits (trimmed) |

```json
{ "email": "asha@example.com", "otp": "081236" }
```

### Success: `200 OK`

Session response (`{ user, accessToken }` + refresh cookie). `user.emailVerified` is `true`.

### Errors

| Status | `code` | When |
|---|---|---|
| 400 | `OTP_INVALID` | Wrong, expired, already used, or the 5 attempts are used up. The message is the same for every cause. Also returned for an unknown email |
| 403 | `ACCOUNT_BLOCKED` | The account is blocked (the email is still marked verified) |
| 422 | `VALIDATION_ERROR` | Bad email or the code is not 6 digits |
| 429 | `RATE_LIMITED` | |

---

## POST `/api/auth/resend-otp`

Sends a fresh code for either purpose. Always answers the same way so it cannot reveal whether an account exists.

- **Auth:** none
- **Rate limit:** OTP limiter

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | yes | Valid email |
| `purpose` | string | yes | `"EMAIL_VERIFY"` or `"PASSWORD_RESET"` |

### Success: `200 OK`

```json
{ "message": "If an account exists for that email, a code has been sent" }
```

### What really happens

| Case | Outcome |
|---|---|
| No such account | Nothing is sent, same `200` |
| `EMAIL_VERIFY` for an already verified account | Nothing is sent, same `200` |
| Last code of that purpose was sent less than 60 s ago | Skipped silently, same `200` |
| 5 codes already sent to this account in the last hour | Skipped silently, same `200` |
| Otherwise | A new code is emailed; earlier unused codes of that purpose are invalidated |

### Errors

| Status | `code` | When |
|---|---|---|
| 422 | `VALIDATION_ERROR` | Bad email or unknown `purpose` |
| 429 | `RATE_LIMITED` | |
| 502 | `EMAIL_SEND_FAILED` | The account exists, a send was attempted and Brevo failed |

Clients should show their own 60-second countdown before offering "Resend".

---

## POST `/api/auth/login`

- **Auth:** none
- **Rate limit:** login limiter (10 / 15 min / IP)

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | yes | Valid email (lower-cased) |
| `password` | string | yes | 1 to 200 chars (checked only against the stored hash) |

```json
{ "email": "asha@example.com", "password": "Passw0rdOK" }
```

### Success: `200 OK`

Session response (`{ user, accessToken }` + refresh cookie). Updates `lastLoginAt`.

### Errors

| Status | `code` | When |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | Unknown email or wrong password |
| 403 | `EMAIL_NOT_VERIFIED` | Correct password, but the email was never verified. The website sends the user to the OTP page |
| 403 | `ACCOUNT_BLOCKED` | Correct password and verified, but blocked |
| 422 | `VALIDATION_ERROR` | |
| 429 | `RATE_LIMITED` | |

```json
{ "message": "Please verify your email before logging in", "code": "EMAIL_NOT_VERIFIED" }
```

The same endpoint is used by the admin panel; the panel refuses non-admin accounts on the client side after login.

---

## POST `/api/auth/refresh`

Exchanges the refresh cookie for a new session. Used on page load (silent login) and after a `401`.

- **Auth:** the `refresh_token` cookie (no `Authorization` header needed)
- **Body:** none

### Success: `200 OK`

Session response with a **new** refresh cookie (the old token is now rotated and unusable).

### Errors (the cookie is cleared on every error)

| Status | `code` | When |
|---|---|---|
| 401 | `REFRESH_INVALID` | No cookie, unknown token, expired or revoked |
| 401 | `REFRESH_REUSED` | The token was already rotated. **All sessions of that user are revoked** |
| 403 | `ACCOUNT_BLOCKED` | The user is blocked. All sessions are revoked |

---

## POST `/api/auth/logout`

Revokes the current refresh token and clears the cookie. Always succeeds.

- **Auth:** none required (uses the cookie if present)
- **Body:** none

### Success: `200 OK`

```json
{ "message": "Logged out" }
```

---

## POST `/api/auth/forgot-password`

Starts a password reset by emailing a code. Same generic answer whether or not the account exists.

- **Auth:** none
- **Rate limit:** password-reset limiter (10 / 15 min / IP)

### Request body

| Field | Type | Required |
|---|---|---|
| `email` | string | yes |

### Success: `200 OK`

```json
{ "message": "If an account exists for that email, a code has been sent" }
```

The cooldown (60 s) and hourly cap (5) are applied silently, as for `resend-otp`. A `502 EMAIL_SEND_FAILED` only occurs if the account exists and the mail provider failed.

---

## POST `/api/auth/verify-reset-otp`

Checks the emailed code and returns a single-use token for the next step.

- **Auth:** none
- **Rate limit:** password-reset limiter

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | yes | |
| `otp` | string | yes | 6 digits |

### Success: `200 OK`

```json
{ "resetToken": "Pz4vQ0m1nXr7sTq8kqYb3w5c1m2uZ9a0JfEoHdLxGhA" }
```

The token is valid for **10 minutes** and works **once**.

### Errors

| Status | `code` | When |
|---|---|---|
| 400 | `OTP_INVALID` | Wrong, expired, used or exhausted code; unknown email |
| 422 | `VALIDATION_ERROR` | |
| 429 | `RATE_LIMITED` | |

---

## POST `/api/auth/reset-password`

Sets a new password using the reset token. **Signs the user out of every device.**

- **Auth:** none
- **Rate limit:** password-reset limiter

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | yes | |
| `resetToken` | string | yes | 1 to 200 chars, the value from `verify-reset-otp` |
| `newPassword` | string | yes | 8 to 72 bytes, a letter and a number |

### Success: `200 OK`

```json
{ "message": "Password has been reset. Please log in again." }
```

### Errors

| Status | `code` | When |
|---|---|---|
| 400 | `RESET_TOKEN_INVALID` | Token wrong, expired (10 min) or already used; also for an unknown email (so emails cannot be probed) |
| 422 | `VALIDATION_ERROR` | Weak new password, etc. |
| 429 | `RATE_LIMITED` | |

---

## GET `/api/auth/me`

Returns the logged-in user.

- **Auth:** Bearer token

### Success: `200 OK`

```json
{ "user": { "id": "…", "name": "Asha Verma", "email": "asha@example.com", "phone": "+919876543210", "role": "USER", "emailVerified": true, "createdAt": "…" } }
```

### Errors

| Status | `code` | When |
|---|---|---|
| 401 | none / `TOKEN_INVALID` | Missing, invalid or expired token; account deleted |
| 403 | `ACCOUNT_BLOCKED` | Blocked account |
| 404 | none | User not found (race with deletion) |

---

# Users (`/api/users`)

All endpoints require a Bearer token. Blocked users get `403 ACCOUNT_BLOCKED`.

## GET `/api/users/me`

Same as `GET /api/auth/me`: `200 { "user": {…} }`.

---

## PATCH `/api/users/me`

Updates your name and/or phone. Email and role cannot be changed here.

### Request body (at least one field)

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | no | 2 to 80 chars |
| `phone` | string | no | Indian mobile (normalised to `+91XXXXXXXXXX`) |

```json
{ "name": "Asha V.", "phone": "9123456780" }
```

### Success: `200 OK`

```json
{ "user": { "id": "…", "name": "Asha V.", "phone": "+919123456780", "…": "…" } }
```

### Errors

| Status | `code` | When |
|---|---|---|
| 409 | `PHONE_EXISTS` | Another account already uses that number |
| 422 | `VALIDATION_ERROR` | Empty body (`Provide at least one field to update`), bad name or phone |

---

## POST `/api/users/me/change-password`

- **Rate limit:** password-reset limiter (10 / 15 min / IP)

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `oldPassword` | string | yes | 1 to 200 chars |
| `newPassword` | string | yes | 8 to 72 bytes, a letter and a number |

### Success: `200 OK`

```json
{ "message": "Password changed. Other sessions have been signed out." }
```

All refresh tokens **except the one belonging to the current cookie** are revoked. If the request has no refresh cookie, every session is revoked. The admin changes their own password with this same endpoint.

### Errors

| Status | `code` | When |
|---|---|---|
| 400 | `INVALID_PASSWORD` | `oldPassword` does not match |
| 422 | `VALIDATION_ERROR` | New password too weak |
| 429 | `RATE_LIMITED` | |

---

## End-to-end examples

### Sign up, verify, then call a protected endpoint

```bash
# 1. signup (the code is printed in the server log in development)
curl -i -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Asha Verma","phone":"9876543210","email":"asha@example.com","password":"Passw0rdOK"}'

# 2. verify (-c saves the refresh cookie)
curl -i -c jar.txt -X POST http://localhost:5001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"asha@example.com","otp":"081236"}'

# 3. use the accessToken from step 2
curl http://localhost:5001/api/users/me -H "Authorization: Bearer <accessToken>"

# 4. get a new access token later from the cookie
curl -b jar.txt -c jar.txt -X POST http://localhost:5001/api/auth/refresh
```

### Forgot password

```bash
curl -X POST http://localhost:5001/api/auth/forgot-password -H "Content-Type: application/json" -d '{"email":"asha@example.com"}'
curl -X POST http://localhost:5001/api/auth/verify-reset-otp -H "Content-Type: application/json" -d '{"email":"asha@example.com","otp":"492017"}'
# -> { "resetToken": "…" }
curl -X POST http://localhost:5001/api/auth/reset-password -H "Content-Type: application/json" \
  -d '{"email":"asha@example.com","resetToken":"…","newPassword":"NewPassw0rd"}'
```
