# 6. API conventions

These rules apply to every endpoint. The endpoint pages (7 to 12) only repeat what is specific to each call.

## Base URL

| Environment | API base | Notes |
|---|---|---|
| Local, no Docker | `http://localhost:5001/api` | Or your `PORT`. The web apps call `/api` and Vite proxies it. |
| Docker | `http://localhost:5001/api` directly, or `http://localhost:8080/api` / `:8081/api` through each web app's nginx | |
| Production | for example `https://api.example.com/api` | |

Health check: `GET /health` (note: **not** under `/api`).

## Request format

| Item | Rule |
|---|---|
| Body | JSON, `Content-Type: application/json`, max **100 kb** |
| Auth | `Authorization: Bearer <accessToken>` on protected endpoints |
| Cookies | Browsers must send credentials (`fetch(..., { credentials: "include" })`) so the `refresh_token` cookie travels to `/api/auth/*` |
| Accept | `application/json` (the CSV export returns `text/csv`) |
| IDs | UUID strings. Public trip URLs use the **slug**; wishlist and enquiries use the trip **id**. |
| Query strings | Values are strings; the server coerces numbers (`page=2`) and accepts `true` / `false` for booleans |

## Success responses

| Shape | Used for |
|---|---|
| `{ "<name>": { … } }` | A single item, for example `{ "user": {…} }`, `{ "destination": {…} }`, `{ "review": {…} }` |
| `{ "data": [ … ], "meta": { … } }` | A paginated list |
| `{ "data": [ … ] }` | A short list that is not paginated (categories, wishlist) |
| `{ "message": "…" }` | An action with nothing to return |
| `204 No Content` (empty body) | Deletes |

### Pagination

```json
{
  "data": [ ],
  "meta": { "page": 1, "limit": 12, "total": 7, "totalPages": 1 }
}
```

`totalPages = ceil(total / limit)`. A page past the end returns an empty `data` array (not an error).

| Query param | Rule |
|---|---|
| `page` | integer ≥ 1, default `1` |
| `limit` | integer ≥ 1 and ≤ the endpoint's maximum |

Defaults and maximums per endpoint:

| Endpoint family | Default `limit` | Max `limit` |
|---|---|---|
| `GET /api/destinations` | 12 | 24 |
| `GET /api/destinations/:slug/reviews` | 10 | 50 |
| Every admin list (`destinations`, `enquiries`, `users`, `reviews`, `audit-log`) | 20 | 100 |

A `limit` above the maximum, or `page=0`, is a `422 VALIDATION_ERROR` (it is not silently clamped).

## Error format

Every error, from every endpoint, has the same JSON shape:

```json
{
  "message": "Human readable summary",
  "code": "MACHINE_READABLE_CODE",
  "errors": [ { "field": "email", "message": "Enter a valid email" } ]
}
```

- `message` is always present and safe to show to users.
- `code` is present for most errors (not for plain `404` "not found" and a few `401` / `403` cases, see below).
- `errors` is present for validation failures and for `NOT_READY`; each entry names the offending field (dotted path for nested values, for example `itinerary.0.title`).

### Validation errors (`422`)

```http
POST /api/auth/signup
{ "name": "A", "phone": "123", "email": "nope", "password": "short" }
```

```json
HTTP/1.1 422 Unprocessable Entity
{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "name", "message": "Name must be at least 2 characters" },
    { "field": "phone", "message": "Enter a valid Indian mobile number" },
    { "field": "email", "message": "Enter a valid email" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

Validation applies to path params, query strings and bodies. Unknown body fields are ignored (zod strips them).

### Error codes

All codes the API can return, with the HTTP status and where they come from.

#### Generic

| HTTP | `code` | Meaning |
|---|---|---|
| 400 | `INVALID_JSON` | The body is not valid JSON |
| 413 | `PAYLOAD_TOO_LARGE` | Body larger than 100 kb |
| 404 | `NOT_FOUND` | No such route: `Route not found: GET /api/xyz` |
| 404 | *(no code)* | A resource was not found (`Destination not found`, `Review not found`, `User not found`, `Category not found`, `Enquiry not found`, `Image not found`) |
| 409 | `CONFLICT` | Safety net for a database unique-constraint race (two identical creates at once) |
| 422 | `VALIDATION_ERROR` | Request failed validation; see `errors[]` |
| 429 | `RATE_LIMITED` | A rate limit was hit; wait and retry |
| 500 | `INTERNAL_ERROR` | Unexpected server error (details are only in the server log) |

#### Authentication and accounts

| HTTP | `code` | Meaning |
|---|---|---|
| 401 | *(no code)* | `Missing bearer token` (no `Authorization: Bearer` header) |
| 401 | `TOKEN_INVALID` | Access token is invalid or expired, or the account no longer exists. The apps react by refreshing |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password (same message for both) |
| 401 | `REFRESH_INVALID` | Refresh cookie missing, unknown, expired or revoked |
| 401 | `REFRESH_REUSED` | A rotated refresh token was presented again; **all of that user's sessions were revoked** |
| 403 | `EMAIL_NOT_VERIFIED` | Login before verifying email, or creating a review with an unverified email |
| 403 | `ACCOUNT_BLOCKED` | The account is blocked (login, refresh, and every authenticated call) |
| 403 | *(no code)* | `Admin access required` (valid user, but not an admin) |
| 409 | `ACCOUNT_EXISTS` | Signup with an email or phone that belongs to a verified account |
| 409 | `PHONE_EXISTS` | Changing your phone to one used by another account |
| 400 | `OTP_INVALID` | Wrong, expired, already used or exhausted code (all give the same message) |
| 400 | `RESET_TOKEN_INVALID` | Reset token wrong, expired, used, or the email is unknown |
| 400 | `INVALID_PASSWORD` | `oldPassword` is wrong when changing password |
| 429 | `OTP_SEND_LIMIT` | Signup requested too many verification emails (5 per hour); includes `Retry-After: 3600` |
| 502 | `EMAIL_SEND_FAILED` | The email provider (Brevo) failed or is not configured |

#### Reviews and enquiries

| HTTP | `code` | Meaning |
|---|---|---|
| 409 | `REVIEW_EXISTS` | You already reviewed this trip (including when your earlier review is currently hidden) |

#### Admin: catalogue

| HTTP | `code` | Meaning |
|---|---|---|
| 409 | `CATEGORY_IN_USE` | Deleting a category that still has trips |
| 409 | `REORDER_MISMATCH` | Reorder list is not exactly every category / image id once |
| 409 | `SLUG_TAKEN` | Another trip already uses that slug (trip update) |
| 409 | `ARCHIVED` | The trip is archived; restore it before editing, publishing, featuring or changing media |
| 409 | `NOT_ARCHIVED` | Restoring a trip that is not archived, or permanently deleting a trip that is not archived |
| 422 | `NOT_READY` | Publish (or editing a live trip) would leave it unpublishable; `errors[]` lists what is missing |

#### Admin: media

| HTTP | `code` | Meaning |
|---|---|---|
| 400 | `UPLOAD_MISSING` | The object is not in R2 yet (the browser upload did not finish or used the wrong key) |
| 409 | `TOO_MANY_IMAGES` | A trip already has 20 images |
| 409 | `IMAGE_EXISTS` | That key is already attached to this trip |
| 409 | `COVER_REQUIRED` | Tried to un-cover the only cover; make another image the cover instead |

#### Admin: users

| HTTP | `code` | Meaning |
|---|---|---|
| 409 | `CANNOT_BLOCK_SELF` | An admin tried to block their own account |
| 409 | `CANNOT_BLOCK_ADMIN` | Tried to block another admin |

### Which status for which mistake

| Situation | Status |
|---|---|
| Malformed JSON | 400 |
| Credentials or token missing/invalid | 401 |
| Authenticated but not allowed (not admin, blocked, unverified) | 403 |
| Unknown route or unknown/hidden resource | 404 |
| Duplicate or state conflict | 409 |
| Body/query/params fail validation, or a business rule on a field | 422 |
| Rate limited | 429 |
| Upstream (email) failure | 502 |

## Caching

| Response | Header |
|---|---|
| `GET /api/destinations`, `GET /api/destinations/:slug`, `GET /api/destinations/:slug/reviews`, `GET /api/categories` | `Cache-Control: public, max-age=60` |
| `GET /api/careers`, `GET /api/careers/:id` | `Cache-Control: no-cache` (always revalidate, so hidden roles vanish at once) |
| Everything else | none (no cache header) |

The websites additionally cache with TanStack Query (1 minute for lists/details, 5 minutes for categories).

## Rate-limit headers

Limited endpoints return the IETF draft-7 headers `RateLimit` and `RateLimit-Policy`. A `429` body is always `{ "message": "...", "code": "RATE_LIMITED" }`. See [Authentication and security](05-authentication-and-security.md#rate-limits) for the numbers.

## Money, dates and identifiers

| Type | Format |
|---|---|
| Price | Integer rupees (`1499`) |
| Discount | `discountPercent = round((original - price) / original * 100)`, `0` when there is no original price or it is not higher than the price |
| Duration | `{ "days": 5, "nights": 4 }` (public) or `durationDays` / `durationNights` (admin) |
| Dates | ISO 8601 UTC strings. Date filters accept `2026-11-01` or a full ISO datetime. |
| Image URL | `R2_PUBLIC_BASE_URL + "/" + key` (each path segment URL-encoded). `null` when a trip has no image. |

## Endpoint index

| Method | Path | Auth | Page |
|---|---|---|---|
| GET | `/health` | none | [Public](08-api-public.md#health) |
| POST | `/api/auth/signup` | none | [Auth](07-api-auth.md#post-apiauthsignup) |
| POST | `/api/auth/verify-email` | none | [Auth](07-api-auth.md#post-apiauthverify-email) |
| POST | `/api/auth/resend-otp` | none | [Auth](07-api-auth.md#post-apiauthresend-otp) |
| POST | `/api/auth/login` | none | [Auth](07-api-auth.md#post-apiauthlogin) |
| POST | `/api/auth/refresh` | cookie | [Auth](07-api-auth.md#post-apiauthrefresh) |
| POST | `/api/auth/logout` | cookie | [Auth](07-api-auth.md#post-apiauthlogout) |
| POST | `/api/auth/forgot-password` | none | [Auth](07-api-auth.md#post-apiauthforgot-password) |
| POST | `/api/auth/verify-reset-otp` | none | [Auth](07-api-auth.md#post-apiauthverify-reset-otp) |
| POST | `/api/auth/reset-password` | none | [Auth](07-api-auth.md#post-apiauthreset-password) |
| GET | `/api/auth/me` | user | [Auth](07-api-auth.md#get-apiauthme) |
| GET | `/api/users/me` | user | [Auth](07-api-auth.md#get-apiusersme) |
| PATCH | `/api/users/me` | user | [Auth](07-api-auth.md#patch-apiusersme) |
| POST | `/api/users/me/change-password` | user | [Auth](07-api-auth.md#post-apiusersmechange-password) |
| GET | `/api/categories` | none | [Public](08-api-public.md#get-apicategories) |
| GET | `/api/destinations` | none | [Public](08-api-public.md#get-apidestinations) |
| GET | `/api/destinations/:slug` | none | [Public](08-api-public.md#get-apidestinationsslug) |
| GET | `/api/destinations/:slug/reviews` | none | [Public](08-api-public.md#get-apidestinationsslugreviews) |
| POST | `/api/destinations/:slug/reviews` | verified user | [Public](08-api-public.md#post-apidestinationsslugreviews) |
| PATCH | `/api/destinations/:slug/reviews/:reviewId` | user (owner) | [Public](08-api-public.md#patch-apidestinationsslugreviewsreviewid) |
| DELETE | `/api/destinations/:slug/reviews/:reviewId` | user (owner) | [Public](08-api-public.md#delete-apidestinationsslugreviewsreviewid) |
| GET | `/api/wishlist` | user | [Public](08-api-public.md#get-apiwishlist) |
| PUT | `/api/wishlist/:destinationId` | user | [Public](08-api-public.md#put-apiwishlistdestinationid) |
| DELETE | `/api/wishlist/:destinationId` | user | [Public](08-api-public.md#delete-apiwishlistdestinationid) |
| POST | `/api/enquiries` | none | [Public](08-api-public.md#post-apienquiries) |
| GET | `/api/careers`, `/api/careers/:id` | none | [Careers](18-careers.md#public-api) |
| GET | `/api/admin/dashboard` | admin | [Admin overview](09-api-admin-overview.md#get-apiadmindashboard) |
| GET | `/api/admin/audit-log` | admin | [Admin overview](09-api-admin-overview.md#get-apiadminaudit-log) |
| GET, POST | `/api/admin/categories` | admin | [Admin overview](09-api-admin-overview.md#categories) |
| PATCH | `/api/admin/categories/reorder` | admin | [Admin overview](09-api-admin-overview.md#patch-apiadmincategoriesreorder) |
| PATCH, DELETE | `/api/admin/categories/:id` | admin | [Admin overview](09-api-admin-overview.md#categories) |
| GET, POST | `/api/admin/destinations` | admin | [Admin destinations](10-api-admin-destinations.md) |
| POST | `/api/admin/destinations/bulk` | admin | [Admin destinations](10-api-admin-destinations.md#post-apiadmindestinationsbulk) |
| GET, PATCH, DELETE | `/api/admin/destinations/:id` | admin | [Admin destinations](10-api-admin-destinations.md) |
| POST | `/api/admin/destinations/:id/publish`, `/unpublish`, `/duplicate`, `/archive`, `/restore` | admin | [Admin destinations](10-api-admin-destinations.md#lifecycle-actions) |
| PATCH | `/api/admin/destinations/:id/featured` | admin | [Admin destinations](10-api-admin-destinations.md#patch-apiadmindestinationsidfeatured) |
| POST | `/api/admin/uploads/presign` | admin | [Admin media](11-api-admin-media.md#post-apiadminuploadspresign) |
| POST | `/api/admin/destinations/:id/images` | admin | [Admin media](11-api-admin-media.md#post-apiadmindestinationsidimages) |
| PATCH | `/api/admin/destinations/:id/images/reorder` | admin | [Admin media](11-api-admin-media.md#patch-apiadmindestinationsidimagesreorder) |
| PATCH, DELETE | `/api/admin/destinations/:id/images/:imageId` | admin | [Admin media](11-api-admin-media.md#patch-apiadmindestinationsidimagesimageid) |
| PUT, DELETE | `/api/admin/destinations/:id/video` | admin | [Admin media](11-api-admin-media.md#put-apiadmindestinationsidvideo) |
| GET | `/api/admin/enquiries`, `/export.csv`, `/:id` | admin | [Admin moderation](12-api-admin-moderation.md#enquiries) |
| PATCH, DELETE | `/api/admin/enquiries/:id` | admin | [Admin moderation](12-api-admin-moderation.md#patch-apiadminenquiriesid) |
| GET | `/api/admin/users`, `/:id` | admin | [Admin moderation](12-api-admin-moderation.md#users) |
| PATCH | `/api/admin/users/:id/block`, `/unblock` | admin | [Admin moderation](12-api-admin-moderation.md#patch-apiadminusersidblock) |
| GET | `/api/admin/reviews` | admin | [Admin moderation](12-api-admin-moderation.md#reviews) |
| PATCH | `/api/admin/reviews/:id/hide`, `/unhide` | admin | [Admin moderation](12-api-admin-moderation.md#patch-apiadminreviewsidhide) |
| DELETE | `/api/admin/reviews/:id` | admin | [Admin moderation](12-api-admin-moderation.md#delete-apiadminreviewsid) |
| GET, POST | `/api/admin/careers` | admin | [Careers](18-careers.md#admin-api) |
| GET | `/api/admin/careers/departments` | admin | [Careers](18-careers.md#admin-api) |
| GET, PATCH, DELETE | `/api/admin/careers/:id` | admin | [Careers](18-careers.md#admin-api) |
