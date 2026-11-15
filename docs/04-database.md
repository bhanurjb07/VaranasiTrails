# 4. Database

- **Engine:** SQLite, accessed through **Prisma 7** and the **libSQL driver adapter** (`@prisma/adapter-libsql`). The same code runs against a local file (`file:./dev.db`) and against **Turso** (`libsql://…`).
- **Schema:** `server/prisma/schema.prisma`. **Migrations:** `server/prisma/migrations/`.
- **IDs:** every `id` is a UUID string (`@default(uuid())`).
- **Enums** are stored as strings.
- The datasource URL is **not** in `schema.prisma` (Prisma 7). The CLI reads it from `server/prisma.config.ts` (`DATABASE_URL`, default `file:./dev.db`); the runtime reads it from `src/lib/prisma.ts`.

## Entity relationships

```
User ──< RefreshToken            (user deleted  => tokens deleted)
User ──< Otp                     (cascade)
User ──< Review >── Destination  (cascade both ways; one review per user per trip)
User ──< WishlistItem >── Destination   (composite key userId+destinationId, cascade)
User ──< AuditLog                (admin who acted; cascade)

Category ──< Destination         (a category with trips cannot be deleted)
Destination ──< DestinationImage       (cascade)
Destination ──< DestinationHighlight   (cascade)
Destination ──< DestinationInclusion   (cascade; isIncluded true = inclusion, false = exclusion)
Destination ──< ItineraryDay           (cascade; unique per destination + dayNumber)
Destination ──< Enquiry          (destination deleted => enquiry.destinationId set to NULL, enquiry kept)
```

## Enums

| Enum | Values |
|---|---|
| `Role` | `USER`, `ADMIN` |
| `OtpPurpose` | `EMAIL_VERIFY`, `PASSWORD_RESET` |
| `EnquiryStatus` | `NEW`, `CONTACTED`, `CLOSED` |
| `Difficulty` | `EASY`, `MODERATE`, `HARD` (the website labels `HARD` as "Challenging") |

## Tables

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | string (PK) | UUID |
| `name` | string | 2 to 80 chars |
| `email` | string, **unique** | Stored lower-case |
| `phone` | string, **unique** | Stored as `+91XXXXXXXXXX` |
| `passwordHash` | string | bcrypt hash (cost from `BCRYPT_ROUNDS`) |
| `role` | `Role` | Default `USER`. Only the bootstrap admin logic sets `ADMIN`. |
| `emailVerifiedAt` | datetime, null | Null means the account is *pending* (cannot log in) |
| `isBlocked` | boolean | Default `false`. Blocked users get `403 ACCOUNT_BLOCKED` everywhere |
| `lastLoginAt` | datetime, null | Updated on login and email verification |
| `createdAt`, `updatedAt` | datetime | |

### `otps`

One row per code sent. The code itself is never stored.

| Column | Type | Notes |
|---|---|---|
| `id` | string (PK) | |
| `userId` | string (FK `users`, cascade) | |
| `email` | string | Email the code was sent to (indexed) |
| `purpose` | `OtpPurpose` | |
| `codeHash` | string | `HMAC-SHA256("<otp id>:<code>")` keyed with `OTP_SECRET` |
| `expiresAt` | datetime | `now + 10 minutes` |
| `attempts` | int | Wrong guesses burn an attempt; 5 kills the code |
| `usedAt` | datetime, null | Set when consumed, superseded by a newer code, or killed |
| `verifiedAt` | datetime, null | Set when the code was correctly entered |
| `resetTokenHash` | string, null | `PASSWORD_RESET` only: HMAC of the single-use reset token |
| `resetTokenExpiresAt` | datetime, null | `now + 10 minutes` after `verify-reset-otp` |
| `createdAt` | datetime | Used for the resend cooldown and hourly cap |

Indexes: `(userId, purpose, createdAt)`, `(email)`.

### `refresh_tokens`

| Column | Type | Notes |
|---|---|---|
| `id` | string (PK) | |
| `userId` | string (FK, cascade) | |
| `tokenHash` | string, **unique** | SHA-256 of the opaque cookie value |
| `expiresAt` | datetime | `now + 30 days` |
| `rotatedAt` | datetime, null | Set when exchanged for a new token. Presenting a rotated token again means reuse |
| `revokedAt` | datetime, null | Logout, rotation, password change, block |
| `createdAt` | datetime | |
| `userAgent` | string, null | First 255 characters of the browser's user agent |
| `ip` | string, null | |

### `categories`

| Column | Type | Notes |
|---|---|---|
| `id` | string (PK) | |
| `slug` | string, **unique** | Generated from the name; **stable on rename** so links keep working |
| `name` | string | 2 to 60 chars |
| `description` | string, null | Up to 300 chars |
| `imageKey` | string, null | R2 key under `categories/<slug>/…` |
| `sortOrder` | int | Position in lists (`0` first) |
| `isActive` | boolean | Inactive categories are hidden from `GET /api/categories`; their trips stay public |
| `createdAt` | datetime | |

### `destinations` (trips)

| Column | Type | Notes |
|---|---|---|
| `id` | string (PK) | |
| `slug` | string, **unique** | Public URL part: `/destinations/<slug>` |
| `title` | string | 3 to 120 chars |
| `tagline` | string | Up to 200; publish needs 10+ |
| `overview` | string | Up to 10,000; publish needs 50+ |
| `city`, `state` | string | Defaults for new drafts: `Varanasi`, `Uttar Pradesh` |
| `country` | string | Default `India` |
| `categoryId` | string (FK `categories`) | Required |
| `priceInr` | int | Whole rupees, 0 to 10,000,000. Publish needs above 0 |
| `originalPriceInr` | int, null | The "was" price. Must be **greater than** `priceInr` |
| `durationDays` | int | 1 to 60 |
| `durationNights` | int | 0 to 60 |
| `maxGroupSize` | int | 1 to 500 (default for new drafts: 10) |
| `difficulty` | `Difficulty` | Default `EASY` |
| `bestTimeToVisit` | string | Up to 200 |
| `meetingPoint` | string, null | Up to 200 |
| `videoUrl` | string, null | Either a full `https://www.youtube.com/embed/<id>` URL or an R2 key (`destinations/<slug>/<random>.mp4|webm`) |
| `isPublished` | boolean | Default `false` |
| `isFeatured` | boolean | Default `false`. Shown in the home page "Featured trips" |
| `ratingAvg` | float | Denormalised average of **visible** reviews, rounded to 1 decimal. `0` when none |
| `ratingCount` | int | Denormalised count of visible reviews |
| `metaTitle` | string, null | SEO, up to 70 |
| `metaDescription` | string, null | SEO, up to 200 |
| `publishedAt` | datetime, null | Set the first time the trip is published; kept afterwards |
| `deletedAt` | datetime, null | **Soft delete** (archive) |
| `createdAt`, `updatedAt` | datetime | |

Indexes: `categoryId`, `priceInr`, `city`, `(isPublished, isFeatured)`, `deletedAt`.

#### Trip lifecycle states

There is no `status` column. The state is derived:

| State | Condition | Visible on the public site |
|---|---|---|
| **draft** | `deletedAt` is null and `isPublished` is false | No |
| **published** | `deletedAt` is null and `isPublished` is true | Yes |
| **archived** | `deletedAt` is set | No (also unpublished and unfeatured at archive time) |

```
            create                 publish (needs readiness)
   (nothing) ────► draft ───────────────────────────────► published
                    ▲  ▲                                      │
                    │  └──────────── unpublish ───────────────┘
                    │
        restore     │                   archive (from draft or published)
   archived ────────┘  ◄───────────────────────────────────────────
       │
       └── delete (permanent; only allowed from archived)
```

### `destination_images`

| Column | Type | Notes |
|---|---|---|
| `id` | string (PK) | |
| `destinationId` | string (FK, cascade) | |
| `key` | string | R2 object key, e.g. `destinations/ganga-aarti-boat-ride/01.webp` |
| `alt` | string | Alt text (up to 200) |
| `sortOrder` | int | Gallery order |
| `isCover` | boolean | **Exactly one cover** per trip is maintained |
| `contentType` | string | Real type read from R2, default `image/webp` |
| `sizeBytes` | int | Real size read from R2 |

Index `(destinationId, sortOrder)`. Duplicated trips share the same keys; a file is deleted from R2 only when no image row, video or category still references the key.

### `itinerary_days`

| Column | Notes |
|---|---|
| `id`, `destinationId` (FK, cascade) | |
| `dayNumber` | int, **unique with `destinationId`**. Assigned by position (1, 2, 3 …) when the admin saves the list |
| `title`, `description` | Title up to 120; description up to 2000 |

### `destination_highlights`

`id`, `destinationId` (FK, cascade), `text` (up to 200), `sortOrder`.

### `destination_inclusions`

One table for both lists: `isIncluded = true` is an inclusion, `false` is an exclusion. Columns: `id`, `destinationId` (FK, cascade), `text` (up to 200), `isIncluded`, `sortOrder`. The API exposes them as two string arrays: `inclusions` and `exclusions`.

### `reviews`

| Column | Type | Notes |
|---|---|---|
| `id` | string (PK) | |
| `userId`, `destinationId` | FKs (cascade) | **Unique together**: one review per user per trip |
| `rating` | int | 1 to 5 |
| `title` | string | 3 to 100 chars |
| `comment` | string | 10 to 2000 chars |
| `isHidden` | boolean | Moderation flag. Hidden reviews vanish from the public site and from the rating |
| `createdAt`, `updatedAt` | datetime | |

Index `(destinationId, createdAt)`.

### `wishlist_items`

Composite primary key `(userId, destinationId)`, both FKs cascade; `createdAt`. A PUT twice leaves one row.

### `enquiries`

| Column | Type | Notes |
|---|---|---|
| `id` | string (PK) | |
| `name` | string | 2 to 80 |
| `email` | string | |
| `phone` | string | `+91XXXXXXXXXX` |
| `destinationId` | string, null (FK, **set null** on delete) | Optional trip the enquiry is about |
| `message` | string | 10 to 2000 |
| `status` | `EnquiryStatus` | Default `NEW` |
| `adminNotes` | string, null | Internal, up to 2000 |
| `createdAt`, `updatedAt` | datetime | |

Index `(status, createdAt)`.

### `job_listings`

Open positions for the Careers page. Not linked to any other table. Columns, rules and the live / draft / closed states are in [Careers](18-careers.md#data-job_listings).

### `audit_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | string (PK) | |
| `adminId` | string (FK `users`, cascade) | Who did it |
| `action` | string | Dotted name such as `destination.publish` (full list in [Admin overview](09-api-admin-overview.md#get-apiadminaudit-log)) |
| `entityType` | string | `destination`, `category`, `enquiry`, `user`, `review` |
| `entityId` | string, null | Null for bulk/export actions |
| `summary` | string | Short human text (max 300 chars). **Never contains secrets** |
| `createdAt` | datetime | |

Indexes `(createdAt)`, `(entityType, entityId)`.

## Derived and denormalised data

| Data | How it is kept correct |
|---|---|
| `destinations.ratingAvg` / `ratingCount` | `recomputeRating(tx, destinationId)` runs **inside the same transaction** as every review create, edit, delete, hide and unhide. It averages only `isHidden = false` reviews. |
| Single cover image | Adding the first image makes it the cover; choosing a new cover clears the others; deleting the cover promotes the next image. Un-covering the only cover is refused (`COVER_REQUIRED`). |
| Category order | `PATCH /admin/categories/reorder` rewrites `sortOrder` to `0..n-1` in one transaction. |
| Image order | `PATCH …/images/reorder` rewrites `sortOrder` the same way. |

## Public visibility rules

These filters are applied in every public query (list, detail, related, reviews, wishlist):

- Trips: `isPublished = true AND deletedAt IS NULL`
- Reviews: `isHidden = false`
- Categories: `isActive = true` (only in the public category list; trips of inactive categories still show)

## Migrations

| Migration folder | What it does |
|---|---|
| `20261105183632_init` | Creates the original schema: users, otps, refresh_tokens, categories, destinations, images, itinerary, highlights, inclusions, reviews, wishlist, enquiries |
| `20261105201452_admin_panel` | Adds user blocking and last login, category description/image/order/active, destination SEO fields and soft delete, image content type and size, enquiry status and admin notes, review hiding, and the `audit_logs` table. Rebuilds some SQLite tables. |

### Local development

```bash
cd server
npx prisma migrate deploy      # apply existing migrations to ./dev.db
npm run db:migrate             # create a NEW migration after editing schema.prisma
npx prisma generate            # regenerate the client (also done by `npm run build`)
npm run db:studio              # browse data
```

### Turso (production)

`prisma migrate` cannot talk to a `libsql://` URL, so apply the migration SQL with the Turso CLI:

```bash
# first time
turso db create varanasitrails
turso db show varanasitrails --url          # copy into TURSO_DATABASE_URL
turso db tokens create varanasitrails       # copy into TURSO_AUTH_TOKEN

# new database: apply every migration in order
for f in prisma/migrations/*/migration.sql; do turso db shell varanasitrails < "$f"; done

# existing database that already has the first migration: apply only the new one
turso db shell varanasitrails < prisma/migrations/20261105201452_admin_panel/migration.sql

# later schema changes: diff the old schema against the new one
git show HEAD:server/prisma/schema.prisma > old.prisma
npx prisma migrate diff --from-schema old.prisma --to-schema prisma/schema.prisma --script > diff.sql
turso db shell varanasitrails < diff.sql
```

Back up first if the database holds real data (`turso db shell varanasitrails .dump > backup.sql`), because migrations rebuild some tables. Seed Turso by running the seed scripts with `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` exported.

### Docker

The server container runs `npx prisma migrate deploy` on every start (see `server/docker-entrypoint.sh`), optionally followed by the sample-data seed (`SEED_ON_START=true`), then starts the API.
