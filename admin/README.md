# VaranasiTrails admin panel (`admin/`)

A separate single-page app for running the site: trips, photos, categories, enquiries, users, reviews and an audit log. It only talks to `/api/admin/*`, `/api/auth/*` and `/api/users/me/change-password` of the VaranasiTrails API. **It has no mock mode**: it always needs the real API and an admin account.

**Stack:** React 19 · Vite · TypeScript (strict) · React Router (lazy routes) · TanStack Query and **Table v8** · Tailwind CSS v4 · react-hook-form + zod · `@dnd-kit` (drag to reorder) · Recharts · lucide-react · sonner. Fonts: Playfair Display and Inter.

> Full documentation lives in [`../docs/`](../docs/README.md): [Admin panel guide](../docs/14-admin-app.md), the admin API ([overview](../docs/09-api-admin-overview.md), [destinations](../docs/10-api-admin-destinations.md), [media](../docs/11-api-admin-media.md), [moderation](../docs/12-api-admin-moderation.md)) and [Troubleshooting](../docs/17-troubleshooting.md).

## Contents

- [Run it](#run-it)
- [Environment](#environment)
- [Access control](#access-control)
- [Screens](#screens)
- [Folder map](#folder-map)
- [How the main screens work](#how-the-main-screens-work)
- [Photo upload pipeline](#photo-upload-pipeline)
- [Tests](#scripts-and-tests)
- [Deploying to Cloudflare Pages](#deploying-to-cloudflare-pages)
- [Notes](#notes)

## Run it

You need the API running with an admin account. In `server/.env` set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (10+ characters, upper and lower case, a number). The server creates or updates that admin every time it starts.

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd admin
npm install
cp .env.example .env     # then set VITE_DEV_PROXY_TARGET to your API's PORT
npm run dev              # http://localhost:5174
```

Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the server's `.env`. Any account that is not an administrator is refused ("No access") and signed straight back out.

## Scripts and tests

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on port **5174** (proxies `/api` to the API) |
| `npm run build` | Type-check (`tsc -b`), then production build into `dist/` (charts and dnd-kit are split into their own chunks) |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | oxlint |
| `npm test` | vitest: API client refresh logic, CSV helpers, image compression, YouTube links, publish checklist |

## Environment

Read in one place: `src/lib/env.ts`. Only `VITE_` variables reach the browser and they are **baked in at build time**.

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_URL` | `/api` | API base URL including `/api`. In production use the full URL, for example `https://api.example.com/api` |
| `VITE_PUBLIC_SITE_URL` | `http://localhost:5173` | The public website, for the "Open public site" and "View on public site" links |
| `VITE_DEV_PROXY_TARGET` | `http://localhost:5001` | **Dev only:** where the Vite proxy forwards `/api`. Set it to the API's `PORT` (the server's `.env` may use 5000) |

## Access control

- Only users with role `ADMIN` get in. After login the panel checks the role; anyone else is logged out on the server too and sees **"No access"**.
- Every route except `/login` sits behind `ProtectedRoute`.
- The access token lives in memory only; the refresh token is the API's `httpOnly` cookie. After a reload the app silently refreshes, and one shared refresh serves all parallel requests.
- `ACCOUNT_BLOCKED` from any call ends the session at once.
- The **server re-checks the admin role on every request**, so the panel is a convenience, not the security boundary.

## Screens

| Path | Screen |
|---|---|
| `/login` | Admin login |
| `/` | Dashboard: stat cards, 30-day enquiries chart, latest enquiries, most wishlisted trips, "Needs attention" |
| `/destinations` | Trip table: search, status tabs (All / Published / Drafts / Archived), category and featured filters, sort, bulk and row actions |
| `/destinations/new`, `/destinations/:id` | Trip editor |
| `/categories` | Drag to reorder, on/off, create/edit with image, delete when empty |
| `/enquiries` | Inbox: status tabs with counts, search, date range, detail drawer, Export CSV |
| `/users` | Accounts with filters; drawer with wishlist, reviews and enquiries; block / unblock |
| `/reviews` | Moderation: hide / unhide / delete |
| `/audit-log` | Every admin action, newest first, grouped by day |
| `/account` | Your details and change password |

List filters live in the URL query string, so a filtered list can be bookmarked and the back button works.

## Folder map

```
src/
├── app/          App, router (lazy routes), providers, error boundaries
├── pages/        One thin file per route; they compose features
├── features/     auth, dashboard, destinations (list + editor + media), categories,
│                 enquiries, users, reviews
├── components/   ui/ (Button, Modal, Drawer, Table, Switch, SortableList, FileDropzone ...),
│                 layout/ (Sidebar, Topbar, Breadcrumbs, MobileNav, AppShell)
├── lib/          apiClient, env, format, csv, slug, youtube, imageCompress, upload, formErrors
├── hooks/        useDebounce, useUrlParams
├── types/        api.ts: types mirroring the admin API
└── styles/       index.css (Tailwind + design tokens)
```

## How the main screens work

- **Destination editor** (`/destinations/new`, `/destinations/:id`). A new trip is saved as a **draft** first (nothing is public). Photos and video need a saved draft. The checklist on the right mirrors the server's publish rules, and **Publish** stays disabled until every item is ticked; if edits are unsaved, Publish saves them first. A live trip cannot be edited into an unpublishable state (the server refuses with `NOT_READY`). Leaving with unsaved changes asks first. The **Preview** tab shows the trip the way the public detail page does, built from the unsaved form. Archived trips are read-only until restored.
- **Publish checklist:** title (3+), tagline (10+), overview (50+), category, price above zero, original price higher than price (if set), duration, at least one photo, a cover photo, at least one itinerary day, at least one highlight.
- **Photos.** Dropped files are resized and converted to WebP in the browser, uploaded straight to R2 through a signed URL with a progress bar per file. Drag to reorder, choose the cover, edit alt text, delete (the file is removed from R2 only when no other trip uses it). Max 20 per trip.
- **Video.** Paste a YouTube link (validated and previewed) or upload an MP4 / WebM (max 50 MB).
- **Destinations list.** Row actions: Publish, Unpublish, Feature, Duplicate, Archive, Restore, Delete permanently (archived only). The bulk bar offers Publish, Unpublish, Feature, Unfeature, Archive and reports which trips could not change and why.
- **Categories.** Drag to reorder, switch off to hide from the public filters, delete only when empty. The image is uploaded the same way as trip photos.
- **Enquiries.** Status tabs with counts, search, date range, a detail drawer (call, WhatsApp and email links, status, internal notes) and **Export CSV** (formula-safe, uses the current filters, up to 10,000 rows).
- **Users / Reviews.** Blocking signs a user out everywhere (never yourself or another admin). Hiding a review removes it from the public site and from the trip's rating; deleting removes it for good.
- **Audit log.** Every admin action, with entity-type, action and date filters, and an "export this page" CSV.

## Photo upload pipeline

For each dropped file (two at a time):

1. Checks: must be an image, source at most 40 MB, trip total at most 20.
2. **Compress in the browser** (`lib/imageCompress.ts`): longest side at most 2000 px, re-encoded as **WebP** under about 400 KB (lowers quality first, then shrinks pixels, keeps the smallest if nothing fits).
3. `POST /api/admin/uploads/presign` → `{ key, uploadUrl }`.
4. `PUT` the file to `uploadUrl` (XMLHttpRequest for progress) with the same `Content-Type`.
5. `POST /api/admin/destinations/:id/images` `{ key, alt }`.

The R2 bucket must allow this admin origin in its CORS policy, otherwise the browser blocks step 4 (policy JSON in [docs/11](../docs/11-api-admin-media.md#bucket-cors)).

## Deploying to Cloudflare Pages

1. Create a Pages project from the repo. Root directory: `admin`. Build command: `npm run build`. Output directory: `dist`.
2. Environment variables (production, build time): `VITE_API_URL=https://api.example.com/api` and `VITE_PUBLIC_SITE_URL=https://app.example.com`.
3. The single-page-app fallback is already in place: `public/_redirects` contains `/* /index.html 200`, so deep links work.
4. On the API: add the admin origin to `CORS_ORIGIN` (together with the public site), set `COOKIE_DOMAIN=.example.com` and keep `COOKIE_SAMESITE=lax` so `admin.example.com` and `api.example.com` share the login cookie. See [docs/05](../docs/05-authentication-and-security.md#the-refresh-cookie) and [docs/15](../docs/15-deployment.md).
5. On the R2 bucket: add the admin origin to the bucket CORS policy, otherwise photo uploads are blocked by the browser.

**Docker:** the repository root `docker-compose.yml` serves the admin panel with nginx on http://localhost:8081 (nginx proxies `/api/` to the API and adds `X-Robots-Tag: noindex, nofollow`).

### Protect the admin domain with Cloudflare Access

The login is the main defence, but put a second gate in front of the whole admin site: in Cloudflare Zero Trust, **Access, Applications, Add an application, Self-hosted**, set the domain to `admin.example.com` and add a policy that allows only your team's email addresses. Visitors then pass a one-time-code or SSO check before they even see the login page. Leave the API's domain unprotected by Access (the public site needs it); the API enforces admin roles itself.

More: [docs/15](../docs/15-deployment.md).

## Notes

- `@tanstack/react-table` is pinned to v8 (v9 has a different API).
- In dev, Vite sometimes reloads the page the first time you open a screen that pulls in new libraries (its dependency optimiser). It does not happen in production builds.
- The API client also supports file downloads (`api.blob`) for the CSV export.
