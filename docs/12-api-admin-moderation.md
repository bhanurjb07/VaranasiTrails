# 12. API: Admin enquiries, users and reviews

Base path: `/api/admin`. Access rules and the common admin errors are at the top of [Admin overview](09-api-admin-overview.md). `:id` is a UUID string.

---

# Enquiries

The inbox for messages sent through `POST /api/enquiries` (see [Public](08-api-public.md#post-apienquiries)).

## The `AdminEnquiry` object

```json
{
  "id": "b1f0c2a4-…",
  "name": "Rohit Sharma",
  "email": "rohit@example.com",
  "phone": "+919876501234",
  "message": "We are a group of six. Can you arrange a private boat for 20 December?",
  "status": "NEW",
  "adminNotes": null,
  "destination": { "id": "9d6f…", "title": "Ganga Aarti & Evening Boat Ride", "slug": "ganga-aarti-boat-ride" },
  "createdAt": "2026-11-14T08:20:00.000Z",
  "updatedAt": "2026-11-14T08:20:00.000Z"
}
```

| Field | Notes |
|---|---|
| `status` | `NEW` (just received) \| `CONTACTED` \| `CLOSED` |
| `adminNotes` | Internal notes (never shown to the visitor), or `null` |
| `destination` | The trip the visitor asked about, or `null` (general enquiry, or the trip was permanently deleted) |

## Shared filters

Used by the list and the CSV export:

| Param | Type | Meaning |
|---|---|---|
| `q` | string (1 to 100) | Contains-match on name, email, phone **or** message |
| `status` | `NEW` \| `CONTACTED` \| `CLOSED` | |
| `destinationId` | string (1 to 64) | Only enquiries about this trip |
| `from` | date | Received on/after (ISO date or datetime) |
| `to` | date | Received on/before |

## GET `/api/admin/enquiries`

Paginated list, newest first. Adds `page` (default 1) and `limit` (1 to 100, default 20) to the shared filters.

### Success: `200 OK`

```json
{
  "data": [ { "…": "AdminEnquiry" } ],
  "meta": { "page": 1, "limit": 20, "total": 20, "totalPages": 1 },
  "counts": { "NEW": 6, "CONTACTED": 3, "CLOSED": 11 }
}
```

`counts` is the number of enquiries **per status across all enquiries** (it ignores the current filters), for the status tabs in the UI.

## GET `/api/admin/enquiries/export.csv`

Downloads the filtered enquiries as a spreadsheet file.

- **Query:** the shared filters only (no `page` / `limit`)
- **Limit:** the 10,000 newest matching enquiries
- **Response:** `200` with `Content-Type: text/csv; charset=utf-8` and `Content-Disposition: attachment; filename="enquiries-YYYY-MM-DD.csv"`
- **Audit:** writes `enquiry.export` (`Exported N enquiries to CSV`)

Columns, in order: `Received`, `Name`, `Email`, `Phone`, `Status`, `Destination`, `Message`, `Admin notes`. Lines end with CRLF.

```csv
Received,Name,Email,Phone,Status,Destination,Message,Admin notes
2026-11-14T08:20:00.000Z,Rohit Sharma,rohit@example.com,+919876501234,NEW,Ganga Aarti & Evening Boat Ride,"We are a group of six, can you arrange a private boat?",
```

### Export CSV

Cells are made safe for spreadsheets ("CSV injection"):

- A cell starting with `=`, `+`, `-`, `@`, a tab or a carriage return gets a leading `'` so Excel/Sheets show it as text instead of running it as a formula (`=HYPERLINK(...)` becomes `'=HYPERLINK(...)`).
- A cell containing a comma, a double quote or a line break is wrapped in double quotes, and inner quotes are doubled.
- Dates are ISO strings; empty values are empty cells.

The admin panel fetches this endpoint as a file (blob) with the user's token and offers it as a download.

## GET `/api/admin/enquiries/:id`

`200 { "enquiry": { …AdminEnquiry } }`. `404` (`Enquiry not found`).

## PATCH `/api/admin/enquiries/:id`

Change the status and/or the internal notes. **At least one** field is required.

### Request body

| Field | Type | Rules |
|---|---|---|
| `status` | string | `NEW` \| `CONTACTED` \| `CLOSED` |
| `adminNotes` | string \| null | Trimmed, up to 2000 chars. `null` clears the notes |

```json
{ "status": "CONTACTED", "adminNotes": "Called on 15 Nov, sending a quote on WhatsApp." }
```

### Success: `200 OK`: `{ "enquiry": { …AdminEnquiry } }`

Audit entry example: `Updated enquiry from Rohit Sharma (status NEW to CONTACTED, notes)`.

### Errors

| Status | When |
|---|---|
| 404 | `Enquiry not found` |
| 422 `VALIDATION_ERROR` | Neither field sent (`Provide status or adminNotes`), unknown status, notes too long |

## DELETE `/api/admin/enquiries/:id`

Permanently deletes the enquiry. `204 No Content`. `404` if unknown. This cannot be undone.

---

# Users

Customer accounts (admin accounts also appear in the list).

## The `AdminUser` object

```json
{
  "id": "5b0c1d9e-…",
  "name": "Asha Verma",
  "email": "asha@example.com",
  "phone": "+919876543210",
  "role": "USER",
  "emailVerified": true,
  "isBlocked": false,
  "lastLoginAt": "2026-11-14T07:55:00.000Z",
  "createdAt": "2026-11-05T18:40:12.000Z",
  "reviewCount": 2,
  "wishlistCount": 5
}
```

## GET `/api/admin/users`

Paginated list, newest accounts first.

### Query parameters (all optional)

| Param | Type | Meaning |
|---|---|---|
| `page`, `limit` | integers | Default 1 and 20; `limit` max 100 |
| `q` | string (1 to 100) | Contains-match on name, email or phone |
| `verified` | `true` \| `false` | `true` = email verified; `false` = pending accounts |
| `blocked` | `true` \| `false` | Filter on the blocked flag |

### Success: `200 OK`

```json
{ "data": [ { "…": "AdminUser" } ], "meta": { "page": 1, "limit": 20, "total": 120, "totalPages": 6 } }
```

## GET `/api/admin/users/:id`

A user together with everything they did on the site, for the detail drawer.

### Success: `200 OK`

```json
{
  "user": { "…": "AdminUser" },
  "wishlist": [
    {
      "addedAt": "2026-11-10T10:00:00.000Z",
      "id": "9d6f…",
      "title": "Ganga Aarti & Evening Boat Ride",
      "slug": "ganga-aarti-boat-ride",
      "priceInr": 1499,
      "status": "published",
      "coverImage": "https://media.example.com/destinations/….webp"
    }
  ],
  "reviews": [
    {
      "id": "e3b8…", "rating": 5, "title": "Magical evening", "comment": "…",
      "isHidden": false, "createdAt": "…",
      "destination": { "id": "9d6f…", "title": "Ganga Aarti & Evening Boat Ride", "slug": "ganga-aarti-boat-ride" }
    }
  ],
  "enquiries": [
    { "id": "b1f0…", "status": "NEW", "message": "…", "destinationTitle": "Ganga Aarti & Evening Boat Ride", "createdAt": "…" }
  ]
}
```

- `wishlist` includes trips in **any** state; `status` is `published` / `draft` / `archived`; newest first.
- `reviews` includes hidden ones (`isHidden`); newest first.
- `enquiries` are those submitted with **the same email address** as the user (the enquiry form does not require an account); up to 50, newest first.

`404` (`User not found`) if unknown.

## PATCH `/api/admin/users/:id/block`

Blocks the account and **signs them out everywhere** (all refresh tokens are revoked). Body: none.

### Success: `200 OK`: `{ "user": { …AdminUser } }` with `isBlocked: true`

From then on that user gets `403 ACCOUNT_BLOCKED` on login, refresh and every authenticated call, immediately (the access token is checked against the database on every request).

### Errors

| Status | `code` | When |
|---|---|---|
| 404 | none | `User not found` |
| 409 | `CANNOT_BLOCK_SELF` | `You cannot block your own account` |
| 409 | `CANNOT_BLOCK_ADMIN` | `Admin accounts cannot be blocked` |

## PATCH `/api/admin/users/:id/unblock`

Un-blocks the account (they can log in again; their old sessions stay revoked, so they must log in again). Body: none. `200 { "user": { …isBlocked: false } }`. `404` if unknown. Unblocking never fails for the self/admin rules.

---

# Reviews

## The `AdminReview` object

```json
{
  "id": "e3b8a1d2-…",
  "rating": 5,
  "title": "Magical evening",
  "comment": "The aarti from the water is something I will never forget.",
  "isHidden": false,
  "createdAt": "2026-11-07T12:30:00.000Z",
  "updatedAt": "2026-11-07T12:30:00.000Z",
  "user": { "id": "5b0c…", "name": "Asha Verma", "email": "asha@example.com" },
  "destination": { "id": "9d6f…", "title": "Ganga Aarti & Evening Boat Ride", "slug": "ganga-aarti-boat-ride" }
}
```

Unlike the public review, the admin view includes the reviewer's id and email and the hidden flag.

## GET `/api/admin/reviews`

Paginated, newest first.

### Query parameters (all optional)

| Param | Type | Meaning |
|---|---|---|
| `page`, `limit` | integers | Default 1 and 20; `limit` max 100 |
| `hidden` | `true` \| `false` | Only hidden / only visible reviews |
| `rating` | integer 1 to 5 | Only this star rating |
| `destinationId` | string (1 to 64) | Only reviews of this trip |
| `q` | string (1 to 100) | Contains-match on title, comment or the reviewer's name |

### Success: `200 OK`

```json
{ "data": [ { "…": "AdminReview" } ], "meta": { "page": 1, "limit": 20, "total": 31, "totalPages": 2 } }
```

## PATCH `/api/admin/reviews/:id/hide`

Hides a review from the public site (list, detail page, counts, star breakdown and the trip's average rating). Body: none.

### Success: `200 OK`: `{ "review": { …AdminReview } }` with `isHidden: true`

The trip's `ratingAvg` / `ratingCount` are recomputed **in the same transaction**. The reviewer is not notified, and they cannot write a second review for that trip while the hidden one exists (`REVIEW_EXISTS`).

## PATCH `/api/admin/reviews/:id/unhide`

Makes it visible again and recomputes the rating. `200 { "review": { … isHidden: false } }`.

## DELETE `/api/admin/reviews/:id`

Permanently deletes the review and recomputes the rating. `204 No Content`. After deletion the author may write a new review for that trip.

### Errors (all three)

| Status | When |
|---|---|
| 404 | `Review not found` |
