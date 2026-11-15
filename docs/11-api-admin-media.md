# 11. API: Admin media (uploads, photos, video)

Base paths: `/api/admin/uploads` and `/api/admin/destinations/:id/images|video`. Access rules and common errors are at the top of [Admin overview](09-api-admin-overview.md).

## How storage works

- Files live in **Cloudflare R2**. The database stores only the **object key** (for example `destinations/ganga-aarti-boat-ride/5f3a1c9d7e2b4a6c8d0e1f2a.webp`).
- The API converts a key into a public URL: `R2_PUBLIC_BASE_URL + "/" + key` (each path segment URL-encoded).
- **The server chooses every key.** The browser never decides where a file goes. Keys look like:

```
<folder>/<slug>/<24 random hex chars>.<ext>

folder = destinations | categories
ext    = jpg | png | webp | avif | mp4 | webm
```

- A key is accepted back from the browser only if it matches `^(destinations|categories)/[a-z0-9-]+/[A-Za-z0-9_-]{6,64}\.(jpg|png|webp|avif|mp4|webm)$` and starts with the expected folder. (The server checks the pattern, not that the slug matches the trip.)

## Limits

| Item | Limit |
|---|---|
| Allowed image types | `image/jpeg`, `image/png`, `image/webp`, `image/avif` |
| Max image size | **10 MB** |
| Allowed video types | `video/mp4`, `video/webm` |
| Max video size | **50 MB** |
| Images per trip | **20** |
| Category image | image types only, 10 MB |
| Presigned URL lifetime | **600 seconds** (10 minutes) |

The admin panel resizes photos to about 2000 px and converts them to WebP under about 400 KB **before** uploading, so real uploads are usually far below the limits (see [Admin panel](14-admin-app.md#photo-upload-pipeline)).

## The three-step upload flow

```
 Admin browser                         API                              R2 bucket
      │ 1. POST /admin/uploads/presign   │                                  │
      │   {destinationId, filename,      │ validates type + size,           │
      │    contentType, sizeBytes}       │ picks key, signs a PUT URL       │
      │◄── { key, uploadUrl, publicUrl } │                                  │
      │                                                                     │
      │ 2. PUT uploadUrl (file bytes, same Content-Type) ──────────────────►│ stores object
      │◄─────────────────────────────────────────────────────── 200 ────────│
      │                                                                     │
      │ 3. POST /admin/destinations/:id/images {key, alt}                   │
      │                                  │ HEAD key ───────────────────────►│
      │                                  │◄── type + size ──────────────────│
      │                                  │ saves the image row              │
      │◄── 201 { destination } ──────────│                                  │
```

Why three steps: the large file goes straight to R2 (not through the API), and step 3 proves the object really exists and is a valid image before a database row is created, using the **real** content type and size read from R2 (not what the browser claimed).

---

## POST `/api/admin/uploads/presign`

Step 1. Returns a one-time URL the browser can `PUT` the file to.

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `destinationId` | string | one of the two | Trip the file is for (photos or video). The trip must exist and **not be archived** |
| `categoryId` | string | one of the two | Category the image is for. Images only |
| `filename` | string | yes | 1 to 200 chars (informational; the key is generated, not derived from this) |
| `contentType` | string | yes | 1 to 100 chars; must be an allowed image or video type |
| `sizeBytes` | integer | yes | Positive; within the limit for the type |

**Exactly one** of `destinationId` / `categoryId` must be sent (sending both or neither is a validation error: `Send either destinationId or categoryId`).

```json
{
  "destinationId": "9d6f1c3e-7a2b-4e0a-8c11-3b5f6a7d8e90",
  "filename": "sunrise-ghat.webp",
  "contentType": "image/webp",
  "sizeBytes": 183422
}
```

### Success: `200 OK`

```json
{
  "key": "destinations/ganga-aarti-boat-ride/5f3a1c9d7e2b4a6c8d0e1f2a.webp",
  "uploadUrl": "https://<account>.r2.cloudflarestorage.com/<bucket>/destinations/ganga-aarti-boat-ride/5f3a….webp?X-Amz-Algorithm=…&X-Amz-Signature=…",
  "publicUrl": "https://media.example.com/destinations/ganga-aarti-boat-ride/5f3a1c9d7e2b4a6c8d0e1f2a.webp",
  "expiresIn": 600
}
```

The `Content-Type` and `Content-Length` are part of the signature, so R2 **rejects an upload that does not match** what was declared here.

### Step 2 (browser to R2, not an API call)

```http
PUT <uploadUrl>
Content-Type: image/webp          ← must equal the contentType sent to /presign
<exactly sizeBytes bytes of file data>
```

R2 answers `200` on success. The bucket needs a [CORS policy](#bucket-cors) allowing the admin origin, otherwise the browser blocks this request.

### Errors

| Status | `code` | When |
|---|---|---|
| 404 | none | `Category not found` (when `categoryId` is used) or `Destination not found` |
| 409 | `ARCHIVED` | `Restore this trip before changing its media` |
| 422 | `VALIDATION_ERROR` | Both or neither of the ids; `contentType` not allowed (field `contentType`: `Use JPEG, PNG, WebP or AVIF images, or MP4 / WebM video`; for categories only images are allowed); `sizeBytes` too large (field `sizeBytes`: `Images can be at most 10 MB` / `Videos can be at most 50 MB`) |

---

## POST `/api/admin/destinations/:id/images`

Step 3. Attaches an uploaded image to the trip.

### Request body

| Field | Type | Required | Rules |
|---|---|---|---|
| `key` | string | yes | 1 to 200 chars; the `key` returned by `/presign` |
| `alt` | string | no | Trimmed, up to 200 chars; default `""` |

```json
{ "key": "destinations/ganga-aarti-boat-ride/5f3a1c9d7e2b4a6c8d0e1f2a.webp", "alt": "Boats on the Ganga at dusk" }
```

### Success: `201 Created`: `{ "destination": { …AdminDestination } }`

- The new image is placed **last** (`sortOrder` = highest + 1).
- If it is the trip's **first** image it automatically becomes the **cover**.
- The saved `contentType` and `sizeBytes` come from R2's `HEAD` response.

### Errors

| Status | `code` | When |
|---|---|---|
| 400 | `UPLOAD_MISSING` | The object is not in R2 (upload not finished, or wrong key) |
| 404 | none | `Destination not found` |
| 409 | `ARCHIVED` | Trip is archived |
| 409 | `TOO_MANY_IMAGES` | `A trip can have at most 20 images` |
| 409 | `IMAGE_EXISTS` | `That image is already on this trip` |
| 422 | `VALIDATION_ERROR` | `key`: `That is not an uploaded image key`; `The uploaded file is not an allowed image type`; `Images can be at most 10 MB` |

---

## PATCH `/api/admin/destinations/:id/images/reorder`

Saves the gallery order after drag-and-drop. Send **every** image id of the trip exactly once.

### Request body

| Field | Type | Rules |
|---|---|---|
| `ids` | string[] | 1 to 200 unique image ids |

```json
{ "ids": ["i-003…", "i-001…", "i-002…"] }
```

### Success: `200 OK`: `{ "destination": { … } }` with `sortOrder` rewritten to `0..n-1`.

### Errors

| Status | `code` | When |
|---|---|---|
| 409 | `REORDER_MISMATCH` | `Send every image id exactly once to reorder` |
| 409 | `ARCHIVED` | Trip is archived |
| 422 | `VALIDATION_ERROR` | Empty list, duplicates, more than 200 |

> This route is declared before `/images/:imageId` so `reorder` is not mistaken for an id.

---

## PATCH `/api/admin/destinations/:id/images/:imageId`

Edit alt text and/or choose the cover. **At least one** field is required.

### Request body

| Field | Type | Rules |
|---|---|---|
| `alt` | string | Trimmed, up to 200 chars |
| `isCover` | boolean | `true` makes this image the cover (all others are un-covered). `false` is only allowed when this image is **not** the cover |

```json
{ "isCover": true }
```

### Success: `200 OK`: `{ "destination": { … } }`

### Errors

| Status | `code` | When |
|---|---|---|
| 404 | none | `Image not found` (not an image of this trip) or trip not found |
| 409 | `COVER_REQUIRED` | `isCover: false` on the current cover. Make another image the cover instead |
| 409 | `ARCHIVED` | Trip is archived |
| 422 | `VALIDATION_ERROR` | Neither `alt` nor `isCover` provided (`Provide alt or isCover`) |

---

## DELETE `/api/admin/destinations/:id/images/:imageId`

Removes an image from the trip.

### Success: `200 OK`: `{ "destination": { … } }` (the updated trip, **not** 204)

- If the deleted image was the cover, the **next remaining image** becomes the cover automatically.
- The stored file is deleted from R2 **only if no other image row, trip video or category image references the same key** (duplicated trips share files).
- If this was the last image, the trip's `readiness` will report it and a published trip cannot be edited into this state through the editor, but deleting images through this endpoint is not blocked by the readiness check, so a live trip could lose its last image. Unpublish first if that is not intended.

### Errors: `404` (`Image not found`), `409 ARCHIVED`

---

## PUT `/api/admin/destinations/:id/video`

Sets (or replaces) the trip's video. Send **exactly one** of the two fields.

### Request body

| Field | Type | Rules |
|---|---|---|
| `youtubeUrl` | string | Up to 300 chars. Accepts `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/embed/ID`, `/shorts/ID`, `/live/ID`, `/v/ID` (also `m.youtube.com` and `youtube-nocookie.com`), `http` or `https`. The 11-character ID is validated. Normalised to `https://www.youtube.com/embed/<ID>` |
| `key` | string | 1 to 200 chars. The key of an uploaded **mp4 / webm** from `/presign` (must end in `.mp4` or `.webm`) |

```json
{ "youtubeUrl": "https://youtu.be/dQw4w9WgXcQ" }
```

```json
{ "key": "destinations/ganga-aarti-boat-ride/aa11bb22cc33dd44ee55ff66.mp4" }
```

### Success: `200 OK`: `{ "destination": { … } }` with `video` set

If a previous uploaded video is replaced (or replaced by a YouTube link) the old file is removed from R2 when unreferenced. YouTube links are not stored files, so nothing is deleted for them.

### Errors

| Status | `code` | When |
|---|---|---|
| 400 | `UPLOAD_MISSING` | `key` is not in R2 |
| 409 | `ARCHIVED` | Trip is archived |
| 422 | `VALIDATION_ERROR` | Both or neither field (`Send either youtubeUrl or key`); `youtubeUrl`: `Paste a YouTube link (watch, youtu.be or embed)` (non-YouTube hosts are rejected); `key`: `That is not an uploaded video key`, `The uploaded file is not an MP4 or WebM video`, `Videos can be at most 50 MB` |

---

## DELETE `/api/admin/destinations/:id/video`

Removes the video (`videoUrl = null`) and deletes the stored file if unreferenced.

### Success: `200 OK`: `{ "destination": { … } }` with `video: null`. Errors: `409 ARCHIVED`, `404`.

---

## Bucket CORS

Browser uploads to R2 only work if the bucket allows the admin origin. In the Cloudflare dashboard: **R2, your bucket, Settings, CORS policy**:

```json
[
  {
    "AllowedOrigins": ["https://admin.example.com", "http://localhost:5174"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["content-type", "content-length"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Replace the origins with yours (the Docker admin panel runs on `http://localhost:8081`). The R2 API token must have **Object Read and Write** on the bucket, and the bucket must be **public** (or have a custom domain) so `R2_PUBLIC_BASE_URL` serves the files.

## Category images

Category images use the same flow with `categoryId` instead of `destinationId`:

1. `POST /uploads/presign` `{ categoryId, filename, contentType, sizeBytes }` (images only).
2. `PUT` the file to `uploadUrl`.
3. Send the returned `key` as `imageKey` in `POST /admin/categories` or `PATCH /admin/categories/:id` (see [Admin overview](09-api-admin-overview.md#categories)). The server verifies it with `HEAD`.

## Troubleshooting uploads

| Symptom | Likely cause |
|---|---|
| Browser console shows a CORS error on the `PUT` | Bucket CORS policy missing the admin origin or the `PUT` method / `content-type` header |
| `PUT` returns `403 SignatureDoesNotMatch` | The `Content-Type` of the `PUT` differs from the `contentType` sent to `/presign`, or the body length differs from `sizeBytes`, or the URL expired (10 minutes) |
| Step 3 returns `UPLOAD_MISSING` | The `PUT` failed or targeted a different bucket (check `R2_BUCKET` / `R2_ACCOUNT_ID`) |
| Images upload but do not display | `R2_PUBLIC_BASE_URL` wrong, or the bucket is not public |
| Local dev with dummy R2 values | Uploads cannot work; the sample trips show placeholder photos instead |
