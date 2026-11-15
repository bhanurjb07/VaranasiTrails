# 10. API: Admin destinations (trips)

Base path: `/api/admin/destinations`. Access rules, the common admin errors and rate limit are listed at the top of [Admin overview](09-api-admin-overview.md). The `:id` here is the trip's UUID.

Media endpoints (photos, video, presigned uploads) are on [page 11](11-api-admin-media.md).

## Trip states recap

| State | Meaning | Editable? |
|---|---|---|
| `draft` | Created, not public | Yes |
| `published` | Live on the public site | Yes, but **an edit that would make it unpublishable is refused** |
| `archived` | Soft-deleted (hidden, unpublished, unfeatured) | **No**. Restore it first (`409 ARCHIVED`) |

## The `AdminDestination` object (detail)

Returned (wrapped as `{ "destination": … }`) by every endpoint that changes or reads one trip.

```json
{
  "id": "9d6f1c3e-7a2b-4e0a-8c11-3b5f6a7d8e90",
  "slug": "ganga-aarti-boat-ride",
  "title": "Ganga Aarti & Evening Boat Ride",
  "tagline": "Watch the legendary Dashashwamedh Ghat aarti from the river itself",
  "overview": "Glide across the Ganga at dusk…",
  "categoryId": "3c1e0a1b-…",
  "category": { "id": "3c1e0a1b-…", "slug": "spiritual", "name": "Pilgrimage" },
  "city": "Varanasi",
  "state": "Uttar Pradesh",
  "country": "India",
  "priceInr": 1499,
  "originalPriceInr": 1999,
  "discountPercent": 25,
  "durationDays": 1,
  "durationNights": 0,
  "maxGroupSize": 12,
  "difficulty": "EASY",
  "bestTimeToVisit": "October to March",
  "meetingPoint": "Dashashwamedh Ghat, Steps 12",
  "metaTitle": null,
  "metaDescription": null,
  "isFeatured": true,
  "isPublished": true,
  "status": "published",
  "publishedAt": "2026-11-06T08:00:00.000Z",
  "deletedAt": null,
  "ratingAvg": 4.6,
  "ratingCount": 12,
  "createdAt": "2026-11-05T18:40:12.000Z",
  "updatedAt": "2026-11-14T09:05:11.000Z",
  "video": { "type": "YOUTUBE", "url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "key": null },
  "images": [
    {
      "id": "i-001…",
      "key": "destinations/ganga-aarti-boat-ride/5f3a1c9d7e2b4a6c8d0e1f2a.webp",
      "url": "https://media.example.com/destinations/ganga-aarti-boat-ride/5f3a1c9d7e2b4a6c8d0e1f2a.webp",
      "alt": "Boats on the Ganga",
      "sortOrder": 0,
      "isCover": true,
      "contentType": "image/webp",
      "sizeBytes": 183422
    }
  ],
  "highlights": ["Private-style boat for the evening aarti"],
  "itinerary": [ { "dayNumber": 1, "title": "Ghats, aarti and diyas", "description": "Meet at 4:30 pm…" } ],
  "inclusions": ["Boat ride with boatman"],
  "exclusions": ["Personal expenses"],
  "readiness": { "ready": true, "errors": [] }
}
```

| Field | Notes |
|---|---|
| `status` | `"draft"` \| `"published"` \| `"archived"` (derived) |
| `video` | `null`, or `{ type: "YOUTUBE", url: <embed url>, key: null }`, or `{ type: "UPLOAD", url: <public url>, key: <R2 key> }` |
| `images` | Ordered by `sortOrder`. Includes the storage `key` (needed for some calls) and the real stored `contentType` / `sizeBytes` |
| `itinerary` | `dayNumber` is assigned by position |
| `readiness` | The publish checklist result: `ready` is true when `errors` is empty. `errors` is `[{ field, message }]` (see [rules](#publish-readiness-rules)) |

## The list row (`DestinationRow`)

Used by the list endpoint (table-ready, lightweight):

```json
{
  "id": "9d6f…",
  "slug": "ganga-aarti-boat-ride",
  "title": "Ganga Aarti & Evening Boat Ride",
  "status": "published",
  "isFeatured": true,
  "priceInr": 1499,
  "originalPriceInr": 1999,
  "category": { "id": "3c1e…", "name": "Pilgrimage", "slug": "spiritual" },
  "city": "Varanasi",
  "coverImage": "https://media.example.com/destinations/…/5f3a….webp",
  "updatedAt": "2026-11-14T09:05:11.000Z",
  "publishedAt": "2026-11-06T08:00:00.000Z",
  "enquiryCount": 4,
  "wishlistCount": 31
}
```

---

## GET `/api/admin/destinations`

Paginated list for the admin table.

### Query parameters (all optional)

| Param | Type | Meaning |
|---|---|---|
| `page` | integer ≥ 1 | Default 1 |
| `limit` | integer 1 to 100 | Default 20 |
| `q` | string (1 to 100) | Contains-match on title, city or slug |
| `status` | `all` \| `published` \| `draft` \| `archived` | Default `all`, which means **everything except archived** (archived trips have their own tab) |
| `category` | string | A category **id or slug** |
| `featured` | `true` \| `false` | Filter on the featured flag |
| `sort` | `updated` \| `newest` \| `title` \| `price_asc` \| `price_desc` | Default `updated` (most recently edited first) |

### Success: `200 OK`

```json
{
  "data": [ { "…": "DestinationRow" } ],
  "meta": { "page": 1, "limit": 20, "total": 7, "totalPages": 1 }
}
```

### Errors

`422 VALIDATION_ERROR` for a bad parameter value.

---

## GET `/api/admin/destinations/:id`

Full detail of one trip, in any state (including archived).

### Success: `200 OK`: `{ "destination": { …AdminDestination } }`

### Errors: `404` (`Destination not found`)

---

## POST `/api/admin/destinations`

Creates a **draft**. Only a title and a category are needed; everything else can be filled in later.

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | **yes** | Trimmed, 3 to 120 chars |
| `categoryId` | string | **yes** | Must be an existing category id |
| `slug` | string | no | Lowercase letters, numbers and single hyphens (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), up to 120. If omitted, generated from the title. **On create, a taken slug is made unique by appending `-2`, `-3` …** (it is not an error here) |
| `tagline` | string | no | Up to 200 chars |
| `overview` | string | no | Up to 10,000 chars |
| `city`, `state`, `country` | string | no | Up to 80 chars each |
| `priceInr` | integer | no | 0 to 10,000,000 |
| `originalPriceInr` | integer \| null | no | 0 to 10,000,000; **must be greater than `priceInr`** when both are present |
| `durationDays` | integer | no | 1 to 60 |
| `durationNights` | integer | no | 0 to 60 |
| `maxGroupSize` | integer | no | 1 to 500 |
| `difficulty` | string | no | `EASY` \| `MODERATE` \| `HARD` |
| `bestTimeToVisit` | string | no | Up to 200 |
| `meetingPoint` | string \| null | no | Up to 200 |
| `metaTitle` | string \| null | no | Up to 70 |
| `metaDescription` | string \| null | no | Up to 200 |
| `isFeatured` | boolean | no | |
| `highlights` | string[] | no | Up to 20 items, each 1 to 200 chars |
| `itinerary` | `{ title, description }[]` | no | Up to 60 days. `title` 1 to 120, `description` 1 to 2000. **Day numbers are assigned by position** |
| `inclusions` | string[] | no | Up to 30 items, each 1 to 200 chars |
| `exclusions` | string[] | no | Up to 30 items, each 1 to 200 chars |

Defaults for omitted fields: `tagline ""`, `overview ""`, `city "Varanasi"`, `state "Uttar Pradesh"`, `country "India"`, `priceInr 0`, `originalPriceInr null`, `durationDays 1`, `durationNights 0`, `maxGroupSize 10`, `difficulty "EASY"`, `bestTimeToVisit ""`, `meetingPoint null`, `metaTitle null`, `metaDescription null`, `isFeatured false`. The trip is always created **unpublished**.

```json
{ "title": "Dev Deepawali Special", "categoryId": "3c1e0a1b-…" }
```

### Success: `201 Created`: `{ "destination": { …AdminDestination } }`

A brand new draft shows `readiness.ready: false` with the list of missing items.

### Errors

| Status | `code` | When |
|---|---|---|
| 422 | `VALIDATION_ERROR` | Rules failed; or `categoryId` does not exist (field `categoryId`: `Category not found`); or the discount rule fails (field `originalPriceInr`: `Original price must be higher than the price`) |

---

## PATCH `/api/admin/destinations/:id`

Updates a trip. **Every field is optional** (the editor sends the whole form, but a partial body works too). Same field rules as create.

- Send `highlights`, `itinerary`, `inclusions` or `exclusions` to **replace** that whole list (inside one transaction). Omit a list to leave it untouched. Send `[]` to empty it.
- `slug` can be edited; changing it breaks old public links.
- `originalPriceInr` is validated against the **stored** price if you send only one of the two.
- Fields **not** editable here: `isPublished` (use publish/unpublish), `isFeatured` (works here, or use the featured endpoint), images and video (see media page).

### Success: `200 OK`: `{ "destination": { …AdminDestination } }`

### Errors

| Status | `code` | When |
|---|---|---|
| 404 | none | `Destination not found` |
| 409 | `ARCHIVED` | `Restore this trip before editing it` |
| 409 | `SLUG_TAKEN` | `That slug is already used by another trip` |
| 422 | `NOT_READY` | The trip is **published** and the edit would leave it unpublishable (for example emptying `highlights`). The change is rolled back. `errors[]` lists what is missing |
| 422 | `VALIDATION_ERROR` | Field rules; unknown `categoryId`; discount not above price |

```json
{
  "message": "This trip is not ready to publish yet",
  "code": "NOT_READY",
  "errors": [ { "field": "highlights", "message": "Add at least one highlight" } ]
}
```

---

## Publish readiness rules

A trip can be published (and a live trip must stay) only if **all** of these hold. The same checklist drives the `readiness` field and the checklist panel in the admin editor.

| Field | Rule | Message |
|---|---|---|
| `title` | 3+ characters | Add a title (at least 3 characters) |
| `tagline` | 10+ characters | Add a tagline (at least 10 characters) |
| `overview` | 50+ characters | Write an overview (at least 50 characters) |
| `categoryId` | present | Choose a category |
| `priceInr` | above 0 | Set a price above zero |
| `originalPriceInr` | null, or greater than `priceInr` | Original price must be higher than the price |
| `durationDays` | at least 1 | Set the trip duration |
| `images` | at least one image | Add at least one image |
| `images` | one of them is the cover | Choose a cover image |
| `itinerary` | at least one day | Add at least one itinerary day |
| `highlights` | at least one | Add at least one highlight |

---

## Lifecycle actions

All are `POST` with **no body**, return `200 { "destination": … }` (except duplicate, `201`), and write an audit row.

### POST `/api/admin/destinations/:id/publish`

Makes the trip public. Sets `isPublished = true` and `publishedAt` (only the **first** time; kept on later republish).

| Status | `code` | When |
|---|---|---|
| 409 | `ARCHIVED` | `Restore this trip before publishing it` |
| 422 | `NOT_READY` | The readiness rules fail; `errors[]` has every missing item |
| 404 | none | Unknown id |

### POST `/api/admin/destinations/:id/unpublish`

Moves the trip back to draft (`isPublished = false`). Wishlists and reviews are kept but not shown publicly while it is unpublished.

### POST `/api/admin/destinations/:id/duplicate`

Creates a **draft** copy: title `"<title> (Copy)"`, slug `"<slug>-copy"` (made unique), not featured, not published. Copies all scalar fields, the video link, highlights, itinerary, inclusions and exclusions, and creates image rows that **point at the same stored files**. Reviews, wishlists, enquiries and ratings are **not** copied. Returns `201`.

> A stored file is only removed from R2 when no image row, video or category image anywhere still references the key, so deleting one of the two trips never breaks the other.

### POST `/api/admin/destinations/:id/archive`

Soft delete: sets `deletedAt`, `isPublished = false`, `isFeatured = false`. Works from draft or published. The trip disappears from the public site, the default admin list and public wishlists.

### POST `/api/admin/destinations/:id/restore`

Brings an archived trip back **as a draft** (publish it again deliberately).

| Status | `code` | When |
|---|---|---|
| 409 | `NOT_ARCHIVED` | `This trip is not archived` |

### PATCH `/api/admin/destinations/:id/featured`

Request body:

| Field | Type | Required |
|---|---|---|
| `isFeatured` | boolean | yes |

```json
{ "isFeatured": true }
```

Success `200 { "destination": … }`. Errors: `409 ARCHIVED` (`Restore this trip first`), `404`. The home page's "Featured trips" shows trips with `isFeatured = true`, best rated first (it falls back to the most popular trips if none are featured).

### DELETE `/api/admin/destinations/:id`

**Permanent** delete. Only allowed for archived trips.

- **Success:** `204 No Content`
- Cascades to images, highlights, itinerary, inclusions, reviews and wishlist rows. Enquiries are kept with `destination` set to null. Stored files that no other trip/category references are deleted from R2 (failures are logged, not returned).

| Status | `code` | When |
|---|---|---|
| 409 | `NOT_ARCHIVED` | `Archive this trip first. Only archived trips can be deleted permanently.` |
| 404 | none | Unknown id |

---

## POST `/api/admin/destinations/bulk`

Apply one action to many trips. **Each trip succeeds or fails independently**; the request itself returns `200` even if some fail.

### Request body

| Field | Type | Rules |
|---|---|---|
| `ids` | string[] | 1 to 200 **unique** trip ids |
| `action` | string | `publish` \| `unpublish` \| `archive` \| `feature` \| `unfeature` |

```json
{ "ids": ["9d6f…", "5e21…", "unknown-id"], "action": "publish" }
```

### Success: `200 OK`

```json
{
  "action": "publish",
  "updated": 1,
  "failed": [
    {
      "id": "5e21…",
      "message": "This trip is not ready to publish yet",
      "errors": [ { "field": "highlights", "message": "Add at least one highlight" } ]
    },
    { "id": "unknown-id", "message": "Destination not found" }
  ]
}
```

`failed[].errors` is present only for `NOT_READY` failures. A single `destination.bulk` audit entry is written (`Bulk publish: 1 done, 2 failed`) in addition to the per-trip entries.

### Errors

`422 VALIDATION_ERROR` for an empty or oversized `ids`, duplicate ids, or an unknown `action`.

> `POST /destinations/bulk` is declared before `/:id` so `bulk` is not read as an id.
