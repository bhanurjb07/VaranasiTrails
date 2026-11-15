# 9. API: Admin overview, audit log and categories

Base path: `/api/admin`. **Every admin endpoint** (this page and pages 10 to 12) has the same access rules:

| Rule | Detail |
|---|---|
| Header | `Authorization: Bearer <accessToken>` of an **ADMIN** user |
| Role check | Re-read from the database on every request (not trusted from the token) |
| Rate limit | 600 requests / 15 minutes / IP, plus the global limit |
| Audit | Every mutating action writes an audit row in the same transaction |

Common access errors for every admin endpoint:

| Status | `code` | When |
|---|---|---|
| 401 | none | No `Authorization: Bearer` header (`Missing bearer token`) |
| 401 | `TOKEN_INVALID` | Invalid/expired token, or the account was deleted |
| 403 | `ACCOUNT_BLOCKED` | The admin account is blocked |
| 403 | none | The user is not an admin (`Admin access required`) |
| 429 | `RATE_LIMITED` | Over 600 requests in 15 minutes |

Path parameter `:id` is a UUID string (1 to 64 chars) on every endpoint; the per-endpoint tables below do not repeat it.

---

## GET `/api/admin/dashboard`

Everything the dashboard screen shows, in one call. No parameters.

### Success: `200 OK`

```json
{
  "destinations": { "published": 5, "draft": 2, "archived": 1, "total": 7 },
  "users": { "total": 120, "verified": 98, "blocked": 2, "newLast30Days": 14 },
  "enquiries": { "NEW": 6, "CONTACTED": 3, "CLOSED": 11, "total": 20 },
  "enquiriesPerDay": [
    { "date": "2026-10-17", "count": 0 },
    { "date": "2026-10-18", "count": 2 }
  ],
  "latestEnquiries": [
    { "id": "b1f0…", "name": "Rohit Sharma", "status": "NEW", "destinationTitle": "Ganga Aarti & Evening Boat Ride", "createdAt": "2026-11-14T08:20:00.000Z" }
  ],
  "topWishlisted": [
    { "id": "9d6f…", "title": "Ganga Aarti & Evening Boat Ride", "slug": "ganga-aarti-boat-ride", "wishlistCount": 31 }
  ],
  "needsAttention": [
    { "id": "5e21…", "title": "Sarnath Buddhist Day Tour", "status": "published", "issues": ["Add at least one highlight"] }
  ]
}
```

| Field | Meaning |
|---|---|
| `destinations.published` / `draft` | Non-archived trips by state |
| `destinations.archived` | Soft-deleted trips |
| `destinations.total` | `published + draft` (archived not included) |
| `users` | All accounts; `verified` = email verified; `blocked`; `newLast30Days` = signed up in the last 30 days |
| `enquiries` | Counts per status plus `total` |
| `enquiriesPerDay` | **Exactly 30 buckets**, one per UTC day for the last 30 days (today included), zeros filled in, oldest first |
| `latestEnquiries` | 5 newest, with the trip title (`null` if none) |
| `topWishlisted` | Up to 5 non-archived trips with at least one wishlist save, most saved first |
| `needsAttention` | Up to 8 non-archived trips that fail the [publish checklist](10-api-admin-destinations.md#publish-readiness-rules): live (published) trips with problems first, then recently edited drafts. `issues` are the human messages from the checklist. Looks at the 200 most recently updated trips |

---

## GET `/api/admin/audit-log`

The history of admin actions, newest first.

### Query parameters (all optional)

| Param | Type | Meaning |
|---|---|---|
| `page` | integer ≥ 1 | Default 1 |
| `limit` | integer 1 to 100 | Default 20 |
| `action` | string (1 to 60) | **Prefix match**: `destination` matches every `destination.*` action; `destination.image` matches the image actions |
| `entityType` | string (1 to 40) | Exact: `destination`, `category`, `enquiry`, `user` or `review` |
| `entityId` | string (1 to 64) | Exact id of the affected record |
| `adminId` | string (1 to 64) | Only actions by this admin |
| `q` | string (1 to 100) | Contains-match on the summary text |
| `from` | date | Inclusive start (ISO date or datetime; `2026-11-01` means midnight UTC) |
| `to` | date | Inclusive end |

An unparseable date is a `422 VALIDATION_ERROR`.

### Success: `200 OK`

```json
{
  "data": [
    {
      "id": "c7d1…",
      "action": "destination.publish",
      "entityType": "destination",
      "entityId": "9d6f1c3e-7a2b-4e0a-8c11-3b5f6a7d8e90",
      "summary": "Published \"Ganga Aarti & Evening Boat Ride\"",
      "createdAt": "2026-11-14T09:05:11.000Z",
      "admin": { "id": "a001…", "name": "Site Admin", "email": "you@example.com" }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 87, "totalPages": 5 }
}
```

### All audit actions

| Action | Written when | `entityType` | `entityId` |
|---|---|---|---|
| `category.create` / `update` / `delete` | Category changes | category | the category id |
| `category.reorder` | Order saved | category | null |
| `destination.create` | New draft | destination | id |
| `destination.update` | Editor saved | destination | id |
| `destination.publish` / `unpublish` | Visibility changes | destination | id |
| `destination.feature` / `unfeature` | Featured flag changes | destination | id |
| `destination.duplicate` | Copy made (the **copy's** id) | destination | new id |
| `destination.archive` / `restore` / `delete` | Lifecycle | destination | id |
| `destination.bulk` | A bulk action ran | destination | null |
| `destination.image.add` / `reorder` / `update` / `delete` | Photo changes | destination | trip id |
| `destination.video.set` / `remove` | Video changes | destination | trip id |
| `enquiry.update` / `delete` | Inbox changes | enquiry | id |
| `enquiry.export` | CSV exported | enquiry | null |
| `user.block` / `unblock` | Moderation | user | id |
| `review.hide` / `unhide` / `delete` | Moderation | review | id |

Summaries are short human sentences (max 300 chars) such as `Blocked Asha Verma (asha@example.com)`. They never contain passwords, tokens or request bodies.

---

# Categories

## The `AdminCategory` object

```json
{
  "id": "3c1e0a1b-…",
  "slug": "spiritual",
  "name": "Pilgrimage",
  "description": "Temples, ghats and sacred journeys.",
  "imageKey": "categories/spiritual/9f8e7d6c5b4a3f2e1d0c9b8a.webp",
  "imageUrl": "https://media.example.com/categories/spiritual/9f8e7d6c5b4a3f2e1d0c9b8a.webp",
  "sortOrder": 0,
  "isActive": true,
  "destinationCount": 3,
  "createdAt": "2026-11-05T18:40:12.000Z"
}
```

`destinationCount` counts **all** trips in the category (drafts and archived included). `imageUrl` is `null` when there is no image.

## GET `/api/admin/categories`

All categories (active and inactive), ordered by `sortOrder` then `name`. No pagination.

```json
{ "data": [ { "…": "AdminCategory" } ] }
```

## POST `/api/admin/categories`

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | yes | Trimmed, 2 to 60 chars |
| `description` | string \| null | no | Trimmed, up to 300 chars |
| `imageKey` | string \| null | no | An R2 key obtained through the [presign flow](11-api-admin-media.md) with `categoryId`. Max 200 chars, characters `A-Z a-z 0-9 / _ . -` only |
| `isActive` | boolean | no | Default `true` |

```json
{ "name": "Honeymoon", "description": "Romantic, unhurried trips for two.", "isActive": true }
```

### Success: `201 Created`

```json
{ "category": { "…": "AdminCategory", "destinationCount": 0 } }
```

- The **slug** is generated from the name (`Food & Culinary` becomes `food-and-culinary`); if taken, `-2`, `-3` … is appended.
- The new category is placed **last** (`sortOrder` = highest + 1).
- If `imageKey` is given it must start with `categories/`, match the server's key pattern, exist in R2 (a `HEAD` request), be an allowed image type and be at most 10 MB.

### Errors

| Status | `code` | When |
|---|---|---|
| 400 | `UPLOAD_MISSING` | `imageKey` is not in R2 yet |
| 422 | `VALIDATION_ERROR` | Rule failures. For an image problem the field is `imageKey` (`That is not an uploaded category image`, `The uploaded file is not an allowed image type`, `Images can be at most 10 MB`) |

## PATCH `/api/admin/categories/:id`

Partial update; **at least one field** is required. Same field rules as create (`imageKey: null` removes the image).

### Success: `200 OK`

```json
{ "category": { "…": "AdminCategory" } }
```

- Renaming **keeps the slug** so public links such as `/destinations?category=spiritual` keep working.
- If the image changes, the old file is deleted from R2 **only if nothing else references it**.

### Errors

| Status | `code` | When |
|---|---|---|
| 400 | `UPLOAD_MISSING` | New `imageKey` is not in R2 |
| 404 | none | `Category not found` |
| 422 | `VALIDATION_ERROR` | Empty body (`Provide at least one field to update`) or rule failures |

## DELETE `/api/admin/categories/:id`

- **Success:** `204 No Content`. The category's image is removed from R2 if unreferenced.

### Errors

| Status | `code` | When |
|---|---|---|
| 404 | none | `Category not found` |
| 409 | `CATEGORY_IN_USE` | It still has trips (any state). Message: `This category has N destination(s). Move them to another category, or deactivate the category instead.` |

## PATCH `/api/admin/categories/reorder`

Saves the order after drag-and-drop. Send **every** category id exactly once, in the new order.

### Request body

| Field | Type | Rules |
|---|---|---|
| `ids` | string[] | 1 to 200 unique ids; must be exactly the full set of existing categories |

```json
{ "ids": ["7a9b…", "3c1e…", "d4f2…"] }
```

### Success: `200 OK`

The full re-ordered list, like `GET /api/admin/categories`:

```json
{ "data": [ { "…": "AdminCategory with sortOrder 0, 1, 2 …" } ] }
```

### Errors

| Status | `code` | When |
|---|---|---|
| 409 | `REORDER_MISMATCH` | Missing, extra or unknown ids (`Send every category id exactly once to reorder`) |
| 422 | `VALIDATION_ERROR` | Empty list, duplicates (`Ids must be unique`) or more than 200 ids |

> `PATCH /categories/reorder` is declared before `/:id` in the router so `reorder` is not mistaken for an id.
