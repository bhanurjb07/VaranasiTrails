# 8. API: Public catalogue

Base path: `/api`. Covers categories, destinations (trips), reviews, wishlist, enquiries and the health check. General rules are in [API conventions](06-api-conventions.md).

**Visibility.** The public API only ever shows trips that are **published and not archived**, reviews that are **not hidden**, and (in the category list) **active** categories. Drafts and archived trips return `404` as if they did not exist.

## Shared objects

### `DestinationCard`

Used in lists, "related trips" and the wishlist.

```json
{
  "id": "9d6f1c3e-7a2b-4e0a-8c11-3b5f6a7d8e90",
  "slug": "ganga-aarti-boat-ride",
  "title": "Ganga Aarti & Evening Boat Ride",
  "tagline": "Watch the legendary Dashashwamedh Ghat aarti from the river itself",
  "city": "Varanasi",
  "coverImage": "https://media.example.com/destinations/ganga-aarti-boat-ride/01.webp",
  "priceInr": 1499,
  "originalPriceInr": 1999,
  "discountPercent": 25,
  "duration": { "days": 1, "nights": 0 },
  "ratingAvg": 4.6,
  "ratingCount": 12
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | UUID (used by the wishlist and enquiries) |
| `slug` | string | Used in URLs and by the detail / review endpoints |
| `title`, `tagline`, `city` | string | |
| `coverImage` | string \| null | Public URL of the cover image (cover first, then lowest sort order); `null` if the trip has no image |
| `priceInr` | integer | Whole rupees |
| `originalPriceInr` | integer \| null | "Was" price |
| `discountPercent` | integer | `0` when there is no valid original price |
| `duration` | `{ days, nights }` | |
| `ratingAvg` | number | One decimal, `0` when unrated |
| `ratingCount` | integer | Visible reviews only |

### `Review`

```json
{
  "id": "e3b8a1d2-0c4f-4a55-9d6e-1f2a3b4c5d6e",
  "rating": 5,
  "title": "Magical evening",
  "comment": "The aarti from the water is something I will never forget.",
  "createdAt": "2026-11-07T12:30:00.000Z",
  "updatedAt": "2026-11-07T12:30:00.000Z",
  "user": { "name": "Asha Verma" }
}
```

Only the reviewer's **name** is exposed (no email, no id). The API does not tell the client which review is the caller's own.

---

## GET `/api/categories`

Active categories for the filter UI and the home page.

- **Auth:** none · **Cache:** `public, max-age=60`
- **Order:** `sortOrder` ascending, then `name`

### Success: `200 OK`

```json
{
  "data": [
    { "id": "3c1e…", "slug": "spiritual", "name": "Pilgrimage" },
    { "id": "7a9b…", "slug": "heritage", "name": "Heritage & Culture" }
  ]
}
```

Inactive categories are omitted here (their published trips are still listed everywhere else).

---

## GET `/api/destinations`

Search, filter, sort and paginate published trips.

- **Auth:** none · **Cache:** `public, max-age=60`

### Query parameters (all optional)

| Param | Type | Rules / meaning |
|---|---|---|
| `q` | string | 1 to 80 chars. Matches `title` **or** `city` (contains). |
| `category` | string | Category **slug** (1 to 80 chars), for example `spiritual` |
| `minPrice`, `maxPrice` | integer ≥ 0 | Inclusive price range in rupees |
| `minDays`, `maxDays` | integer ≥ 0 | Inclusive range on `duration.days` |
| `difficulty` | `EASY` \| `MODERATE` \| `HARD` | |
| `featured` | `true` \| `false` | Only the literal strings are accepted |
| `sort` | see below | Default `popular` |
| `page` | integer ≥ 1 | Default `1` |
| `limit` | integer 1 to **24** | Default `12` |

Sort values:

| `sort` | Order |
|---|---|
| `popular` (default) | `ratingCount` desc, `ratingAvg` desc |
| `rating` | `ratingAvg` desc, `ratingCount` desc |
| `price_asc` | `priceInr` asc |
| `price_desc` | `priceInr` desc |
| `newest` | `createdAt` desc |

Ties are broken by `id` so pagination is stable.

```http
GET /api/destinations?category=spiritual&maxPrice=3000&sort=price_asc&page=1&limit=12
```

### Success: `200 OK`

```json
{
  "data": [ { "…": "DestinationCard" } ],
  "meta": { "page": 1, "limit": 12, "total": 7, "totalPages": 1 }
}
```

### Errors

| Status | `code` | When |
|---|---|---|
| 422 | `VALIDATION_ERROR` | Bad type or value (for example `limit=100`, `sort=cheap`, `featured=yes`) |

---

## GET `/api/destinations/:slug`

Everything the trip detail page needs in one call.

- **Auth:** none · **Cache:** `public, max-age=60`
- **Path:** `slug`, 1 to 120 chars

### Success: `200 OK`

```json
{
  "destination": {
    "id": "9d6f1c3e-7a2b-4e0a-8c11-3b5f6a7d8e90",
    "slug": "ganga-aarti-boat-ride",
    "title": "Ganga Aarti & Evening Boat Ride",
    "tagline": "Watch the legendary Dashashwamedh Ghat aarti from the river itself",
    "overview": "Glide across the Ganga at dusk…",
    "city": "Varanasi",
    "state": "Uttar Pradesh",
    "country": "India",
    "category": { "id": "3c1e…", "slug": "spiritual", "name": "Pilgrimage" },
    "priceInr": 1499,
    "originalPriceInr": 1999,
    "discountPercent": 25,
    "duration": { "days": 1, "nights": 0 },
    "maxGroupSize": 12,
    "difficulty": "EASY",
    "bestTimeToVisit": "October to March",
    "meetingPoint": "Dashashwamedh Ghat, Steps 12",
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "isFeatured": true,
    "ratingAvg": 4.6,
    "ratingCount": 12,
    "ratingBreakdown": { "1": 0, "2": 0, "3": 1, "4": 3, "5": 8 },
    "images": [
      { "url": "https://media.example.com/destinations/ganga-aarti-boat-ride/01.webp", "alt": "Boats on the Ganga at dusk", "isCover": true }
    ],
    "highlights": ["Private-style boat for the evening aarti", "Floating diya offering at sunset"],
    "itinerary": [
      { "dayNumber": 1, "title": "Ghats, aarti and diyas", "description": "Meet at 4:30 pm…" }
    ],
    "inclusions": ["Boat ride with boatman", "Bottled water"],
    "exclusions": ["Personal expenses", "Travel insurance"],
    "latestReviews": [ { "…": "Review (5 newest)" } ],
    "related": [ { "…": "DestinationCard (up to 6)" } ],
    "createdAt": "2026-11-05T18:40:12.000Z",
    "updatedAt": "2026-11-06T09:12:44.000Z"
  }
}
```

| Field | Notes |
|---|---|
| `videoUrl` | A full URL. If the trip has an uploaded video, the R2 key is converted to its public URL; YouTube trips return the embed URL. `null` if none |
| `difficulty` | `EASY`, `MODERATE`, `HARD` |
| `ratingBreakdown` | Count of visible reviews per star `"1"` to `"5"` (always all five keys) |
| `images` | **All** images ordered by `sortOrder` (the cover is flagged with `isCover`, not necessarily first) |
| `highlights`, `inclusions`, `exclusions` | Plain string arrays in display order |
| `itinerary` | Ordered by `dayNumber` |
| `latestReviews` | The 5 newest visible reviews |
| `related` | Up to 6 other published trips sharing the same category **or** city, best rated first |

### Errors

| Status | `code` | When |
|---|---|---|
| 404 | none | Unknown slug, or the trip is a draft or archived (`Destination not found`) |

---

## GET `/api/destinations/:slug/reviews`

Paginated visible reviews, newest first.

- **Auth:** none · **Cache:** `public, max-age=60`

### Query parameters

| Param | Rules |
|---|---|
| `page` | integer ≥ 1, default 1 |
| `limit` | integer 1 to **50**, default 10 |

### Success: `200 OK`

```json
{
  "data": [ { "…": "Review" } ],
  "meta": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 }
}
```

### Errors

| Status | When |
|---|---|
| 404 | Unknown or unpublished trip |
| 422 `VALIDATION_ERROR` | Bad `page` / `limit` |

---

## POST `/api/destinations/:slug/reviews`

Create your review of a trip.

- **Auth:** Bearer token **and a verified email**

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `rating` | integer | yes | 1 to 5 (must be a JSON number, not a string) |
| `title` | string | yes | Trimmed, 3 to 100 chars |
| `comment` | string | yes | Trimmed, 10 to 2000 chars |

```json
{ "rating": 5, "title": "Magical evening", "comment": "The aarti from the water is something I will never forget." }
```

### Success: `201 Created`

```json
{ "review": { "id": "e3b8…", "rating": 5, "title": "Magical evening", "comment": "…", "createdAt": "…", "updatedAt": "…", "user": { "name": "Asha Verma" } } }
```

The trip's `ratingAvg` and `ratingCount` are recomputed in the same transaction.

### Errors

| Status | `code` | When |
|---|---|---|
| 401 | none / `TOKEN_INVALID` | Not logged in |
| 403 | `EMAIL_NOT_VERIFIED` | Email not verified yet |
| 403 | `ACCOUNT_BLOCKED` | Blocked account |
| 404 | none | Trip not found or unpublished |
| 409 | `REVIEW_EXISTS` | You already reviewed this trip (even if your review is currently hidden by an admin) |
| 422 | `VALIDATION_ERROR` | Rating, title or comment out of range |

---

## PATCH `/api/destinations/:slug/reviews/:reviewId`

Edit your own review. Partial body; at least one field is required.

- **Auth:** Bearer token (owner only)

### Request body

| Field | Type | Rules |
|---|---|---|
| `rating` | integer | 1 to 5 |
| `title` | string | 3 to 100 chars |
| `comment` | string | 10 to 2000 chars |

### Success: `200 OK`

```json
{ "review": { "…": "Review (updated)" } }
```

### Errors

| Status | When |
|---|---|
| 404 | The review does not exist, is not yours, or does not belong to the trip in the URL (`Review not found`) |
| 422 `VALIDATION_ERROR` | Empty body (`Provide at least one field to update`) or invalid values |

---

## DELETE `/api/destinations/:slug/reviews/:reviewId`

Delete your own review.

- **Auth:** Bearer token (owner only)
- **Success:** `204 No Content`
- **Errors:** `404` as above. The trip's rating is recomputed.

---

## GET `/api/wishlist`

The caller's saved trips, most recently added first. Trips that have since been unpublished or archived are left out.

- **Auth:** Bearer token

### Success: `200 OK`

```json
{
  "data": [
    { "id": "9d6f…", "slug": "ganga-aarti-boat-ride", "title": "…", "…": "all DestinationCard fields", "addedAt": "2026-11-08T10:00:00.000Z" }
  ]
}
```

Not paginated.

---

## PUT `/api/wishlist/:destinationId`

Add a trip to the wishlist. **Idempotent**: calling it twice leaves one row.

- **Auth:** Bearer token
- **Path:** `destinationId` is the trip **id** (not the slug), 1 to 64 chars
- **Body:** none

### Success: `200 OK`

```json
{ "wishlisted": true }
```

### Errors

| Status | When |
|---|---|
| 404 | Trip does not exist, is a draft, or is archived (`Destination not found`) |

---

## DELETE `/api/wishlist/:destinationId`

Remove a trip. Always succeeds, even if it was not in the wishlist.

- **Auth:** Bearer token
- **Success:** `200 OK` with `{ "wishlisted": false }`

---

## POST `/api/enquiries`

Public contact/enquiry form. Stored in the database and optionally emailed to `ENQUIRY_NOTIFY_EMAIL`. A WhatsApp chat is the main booking route; this is the alternative for visitors who prefer a form.

- **Auth:** none
- **Rate limit:** 5 per hour per IP (`429 RATE_LIMITED`)

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | yes | Trimmed, 2 to 80 chars |
| `email` | string | yes | Valid email (lower-cased) |
| `phone` | string | yes | Indian mobile, normalised to `+91XXXXXXXXXX` |
| `destinationId` | string | no | The **id** of a trip (1 to 64 chars) |
| `message` | string | yes | Trimmed, 10 to 2000 chars |

```json
{
  "name": "Rohit Sharma",
  "email": "rohit@example.com",
  "phone": "9876501234",
  "destinationId": "9d6f1c3e-7a2b-4e0a-8c11-3b5f6a7d8e90",
  "message": "We are a group of six. Can you arrange a private boat for 20 December?"
}
```

### Success: `201 Created`

```json
{ "id": "b1f0c2a4-…", "message": "Thanks! We will get back to you soon." }
```

The enquiry starts as status `NEW` and appears in the admin inbox and dashboard.

### Behaviour notes

- The notification email lists name, email, phone, destination title and the message (HTML-escaped). If sending fails the error is logged and **the request still succeeds**, because the enquiry is already saved.
- `destinationId` is checked against **any** trip (including drafts), so an enquiry about a trip that is later archived or deleted is still kept (the link is set to null on delete).

### Errors

| Status | `code` | When |
|---|---|---|
| 404 | none | `destinationId` does not match any trip |
| 422 | `VALIDATION_ERROR` | Field rules failed |
| 429 | `RATE_LIMITED` | More than 5 enquiries per hour from this IP |

---

## Health

### GET `/health`

Liveness probe used by Docker and hosts. **Not** under `/api`; not logged; counts toward the global rate limit.

```json
{ "status": "ok" }
```
