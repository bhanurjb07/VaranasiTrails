# 14. Admin panel (`admin/`)

A separate single-page app for running the site: trips, photos, categories, enquiries, users, reviews and an audit log. It only talks to `/api/admin/*` and `/api/auth/*` + `/api/users/me/change-password` of the API. **It has no mock mode**; it always needs the real server and an admin account.

Libraries: React 19, Vite, TypeScript (strict), React Router (lazy routes), TanStack Query, **TanStack Table v8** (pinned; v9 has a different API), react-hook-form + zod, Tailwind CSS v4, `@dnd-kit` (drag to reorder), Recharts (dashboard chart), lucide-react, sonner. Fonts: Fraunces and Inter. The dev server runs on **port 5174**.

## Access control

- Log in at `/login` with the admin email and password (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from the server's `.env`).
- After login the panel checks `user.role`. Anyone who is **not** `ADMIN` is logged out on the server too and shown **"No access"** with a "Back to login" button.
- Every route except `/login` is wrapped in `ProtectedRoute` (spinner while restoring, redirect to `/login` with `state.from` when anonymous).
- The access token is kept **in memory only**; the refresh token is the API's `httpOnly` cookie. After a reload the panel silently refreshes; one shared refresh serves all parallel requests.
- `ACCOUNT_BLOCKED` from any call clears the session immediately.
- The server enforces everything again: each admin request re-checks the role in the database. The panel is a convenience, not the security boundary.
- Production hosting adds `X-Robots-Tag: noindex, nofollow`, and putting the whole admin domain behind Cloudflare Access is recommended ([Deployment](15-deployment.md#protect-the-admin-domain)).

## Screens and routes

Defined in `src/app/router.tsx`. All routes except `/login` render inside `AppShell` (sidebar, top bar, breadcrumbs, mobile navigation).

| Path | Page | What it does |
|---|---|---|
| `/login` | `LoginPage` | Email + password. Notices for blocked, unverified and non-admin accounts |
| `/` | `DashboardPage` | Stat cards (published trips, drafts, new enquiries, users), a 30-day enquiries chart, latest enquiries, most wishlisted trips, "Needs attention" list |
| `/destinations` | `DestinationsPage` | Trip table with search, status tabs, category and featured filters, sort, bulk actions, row actions |
| `/destinations/new` | `DestinationEditorPage` | Create a draft |
| `/destinations/:id` | `DestinationEditorPage` | Edit a trip (any state) |
| `/categories` | `CategoriesPage` | Drag to reorder, switch on/off, create/edit with image, delete when empty |
| `/enquiries` | `EnquiriesPage` | Inbox with status tabs and counts, search, date range, detail drawer, **Export CSV** |
| `/users` | `UsersPage` | Account list with filters; detail drawer (wishlist, reviews, enquiries); block/unblock |
| `/reviews` | `ReviewsPage` | Moderation list: hide/unhide, delete |
| `/audit-log` | `AuditLogPage` | Timeline of admin actions grouped by day, filters, "export this page" CSV |
| `/account` | `AccountPage` | Change your own password |
| `*` | `NotFoundPage` | 404 inside the shell |

All list filters live in the **URL query string** (`useUrlParams` / `useListParams`), so a filtered list can be bookmarked or shared, and the back button works. Any filter change returns to page 1.

## Folder map

```
admin/src/
├── app/            App, router (lazy), providers (Query + Auth + Toaster), error boundaries
├── pages/          thin route files
├── features/
│   ├── auth/       AuthProvider, ProtectedRoute, LoginForm, ChangePasswordForm, api.ts
│   ├── dashboard/  StatCard, EnquiriesChart, DashboardLists, useDashboard
│   ├── destinations/
│   │   ├── api.ts, useDestinations.ts, useListParams.ts, StatusBadge.tsx
│   │   ├── components/   DestinationTable, ListToolbar, BulkBar
│   │   └── editor/       DestinationEditor, EditorHeader, sections (Basics, Pricing, Media, Highlights,
│   │                     Itinerary, Inclusions, Seo), ImageUploader/ImageGrid, VideoSection, PreviewTab,
│   │                     ReadinessChecklist, readiness.ts, formSchema.ts, useImageUpload, useMediaMutations
│   ├── categories/ CategoryList, CategoryModal, api.ts, useCategories
│   ├── enquiries/  EnquiryDrawer, EnquiryStatusBadge, api.ts, useEnquiries
│   ├── users/      UserDrawer, useUsers
│   └── reviews/    useReviews
├── components/     ui/ (Button, Modal, Drawer, Table, Tabs, Switch, SortableList, FileDropzone, ConfirmDialog …),
│                   layout/ (AppShell, Sidebar, Topbar, Breadcrumbs, MobileNav, PageHeader, navItems)
├── lib/            apiClient, env, format, csv, slug, youtube, imageCompress, upload, formErrors, cn
├── hooks/          useDebounce, useUrlParams
├── types/api.ts    TypeScript types mirroring the admin API
└── styles/index.css
```

The sidebar entries (`components/layout/navItems.ts`): Dashboard, Destinations, Categories, Enquiries, Users, Reviews, Audit log.

## The destination editor

The most important screen. Route `/destinations/new` (create) and `/destinations/:id` (edit).

**Layout:** header with actions · an Edit / Preview tab switch · the form sections on the left · a sticky **publish checklist** on the right. Sections: Basics, Pricing and duration, Media, Highlights, Itinerary, Inclusions and exclusions, SEO.

### Create → save → publish flow

1. **New trip.** Fill at least a title and a category and click **Save**. The panel calls `POST /admin/destinations` and the trip is created as a **draft** (nothing is public). It then redirects to `/destinations/:id` and says "Draft saved. You can add photos now."
2. **Photos and video need a saved draft** (they are attached to a trip id), which is why saving comes first.
3. **Edit.** Each Save calls `PATCH /admin/destinations/:id` with the whole form (lists are replaced).
4. **Checklist.** The right-hand panel (`readiness.ts`) mirrors the server's [publish rules](10-api-admin-destinations.md#publish-readiness-rules): title 3+, tagline 10+, overview 50+, category, price above zero, valid discount, duration, one photo, a cover, one itinerary day, one highlight. Items link to the matching section.
5. **Publish** stays disabled until every item is ticked. If there are unsaved edits, Publish **saves first**, then publishes, so what is live equals what is on screen. The server enforces the same rules (`422 NOT_READY`).
6. **Live trips stay valid.** Saving an edit that would make a published trip unpublishable is refused by the server (`NOT_READY`) and shown as a toast.
7. Other header actions: Unpublish, Duplicate (opens the copy), Archive (confirmation), Restore (when archived).

### Behaviours worth knowing

- **Unsaved changes guard.** Navigating away with unsaved edits asks "Leave without saving?" (router blocker) and the browser warns on tab close.
- **Archived trips** show a banner and every section is read-only until you restore them.
- **Slug.** Optional on create; the server generates one from the title. Editing it later can break old public links. A taken slug shows `SLUG_TAKEN` on the slug field.
- **Server validation errors** are mapped back onto the matching form fields (`applyServerErrors`).
- **Preview tab** renders the trip approximately as the public detail page would, from the **unsaved** form values.
- The form uses `{ value: string }` objects for string lists (required by `useFieldArray`) and converts them to plain arrays in `toPayload`. Empty strings for `meetingPoint`, `metaTitle`, `metaDescription` are sent as `null`.

### Form rules (client side, `formSchema.ts`, mirror the server)

| Field | Rule |
|---|---|
| Title | 3 to 120 chars |
| Slug | empty or lowercase letters/numbers/hyphens |
| Tagline | up to 200 |
| Overview | up to 10,000 |
| Price, original price | whole rupees 0 to 10,000,000; original must be greater than price |
| Days / nights / group size | 1 to 60 / 0 to 60 / 1 to 500 |
| Meta title / description | up to 70 / 200 |
| Highlights / inclusions / exclusions | up to 20 / 30 / 30 items, each 1 to 200 chars |
| Itinerary | up to 60 days; day title 1 to 120, description 1 to 2000 |

## Photo upload pipeline

`features/destinations/editor/useImageUpload.ts`. For each dropped file (at most **2 uploads at a time**):

1. **Checks:** must be an image; source file at most 40 MB; at most 20 photos per trip (extra files are skipped with a warning).
2. **Compress in the browser** (`lib/imageCompress.ts`): decode, scale so the longest side is at most **2000 px** (never upscaled), re-encode as **WebP**. It tries qualities 0.85 down to 0.38, then shrinks the pixels by 15% and tries again (up to 6 shrinks), aiming for **under about 400 KB**; if nothing fits it keeps the smallest result.
3. **Presign:** `POST /admin/uploads/presign` with the compressed size and `image/webp`.
4. **Upload:** `PUT` straight to R2 with an `XMLHttpRequest` (for a progress bar) and the same `Content-Type` (`lib/upload.ts`).
5. **Attach:** `POST /admin/destinations/:id/images` `{ key, alt }`, where `alt` defaults to the file name without extension. The panel then replaces its cached trip.

Each file shows a status: queued → compressing → uploading → saving → done (or error with a message). The photo grid supports drag-to-reorder (dnd-kit), choosing the cover, editing alt text and deleting. Deleting only removes the file from R2 when no other trip uses it.

Category images use the same compress + presign (`categoryId`) + upload flow inside the category dialog.

## Video

Paste a YouTube link (`lib/youtube.ts` applies **the same rules as the server**: watch, youtu.be, embed, shorts, live; normalised to an embed URL; previewed before saving), or upload an MP4/WebM (max 50 MB).

## Destinations list

- Columns: row checkbox, Trip (cover and title), Category, Price, Status badge, Featured, Enquiries / Saves (counts), Updated (relative time), row actions.
- Tabs: All (excludes archived), Published, Drafts, Archived. Filters: search (title / city / slug), category, featured. Sort: recently updated, newest, title, price.
- **Row actions:** Publish, Unpublish, Feature/Unfeature, Duplicate, Archive (confirm), Restore, **Delete permanently** (archived only, confirm).
- **Bulk bar** appears when rows are selected: Publish, Unpublish, Feature, Unfeature, Archive. It calls `POST /admin/destinations/bulk` and reports "N trips updated" or "N updated, M could not change: <first reason>".

## Categories

Drag rows to reorder (`PATCH /categories/reorder`), toggle **Active** (inactive categories vanish from the public filters; their trips stay public), create/edit in a dialog (name, description, image, active), delete only when the category has no trips (otherwise a warning suggests moving the trips or switching it off).

## Enquiries

Status tabs (All / New / Contacted / Closed) with counts from the API, search (name, email, phone, message), a **date range**, a pagination bar and a detail drawer with call, WhatsApp and email links, a status selector and internal notes. **Export CSV** downloads the **current filters** (up to 10,000 rows) via `GET /admin/enquiries/export.csv` and saves it as a file. Cells are formula-safe.

## Users and reviews

- **Users:** search, verified and blocked filters. The drawer shows the profile, wishlist, reviews and enquiries (matched by email). **Block** signs the user out everywhere; admins and yourself cannot be blocked.
- **Reviews:** filter by visibility, rating, trip and text. **Hide** removes a review from the public site and from the trip's rating; **Delete** removes it for good. Both refresh the destination data because ratings change.

## Audit log

Newest first, grouped by day, 30 per page. Filters: entity type, action prefix and a date range (sent as `from=<date>T00:00:00.000Z`, `to=<date>T23:59:59.999Z`). Action badges are coloured by type (delete = danger; block/archive/hide = warning; publish = success; other = info). "Export this page" saves the visible page as CSV.

## Account page

Shows the admin's details and a **change password** form (`POST /users/me/change-password`). Other sessions are signed out.

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_URL` | `/api` | API base including `/api` (production: `https://api.example.com/api`) |
| `VITE_PUBLIC_SITE_URL` | `http://localhost:5173` | Public site for "Open public site" / "View on public site" links |
| `VITE_DEV_PROXY_TARGET` | `http://localhost:5001` | Dev only: proxy target for `/api` |

Details: [Environment variables](03-environment-variables.md#admin-panel-adminenv).

## Scripts and tests

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on 5174 |
| `npm run build` | `tsc -b` + production build (charts and dnd-kit are split into their own chunks) |
| `npm run preview` | Serve the build |
| `npm run typecheck` / `lint` / `test` | `tsc -b` / oxlint / vitest |

Test files: `lib/apiClient.test.ts` (refresh logic), `lib/csv.test.ts` (formula-safe CSV), `lib/imageCompress.test.ts` (resize + quality search), `lib/youtube.test.ts` (link parsing), `features/destinations/editor/readiness.test.tsx` (publish checklist). See [Testing](16-testing.md).

## Design and theme

The admin panel uses the same "Ganga at dusk" palette, fonts (Fraunces and Inter), logo mark and motion as the public site; the tokens in `src/styles/index.css` mirror `client/src/styles/index.css`, plus admin-only status colours. Light and dark mode are switched with the small sun/moon button in the top bar (and on the login page); the choice is stored in `localStorage` (`vt_theme`) and the system setting is followed until one is chosen. The sidebar and login panel use the always-dark `bg-dusk` brand gradient. The dashboard chart reads its colours from the same tokens, so it follows the theme too.

## Notes

- In dev, Vite sometimes reloads the page the first time you open a screen that pulls in new libraries (its dependency optimiser). It does not happen in production builds.
- The admin `apiClient` also supports `api.blob(...)` for file downloads (used by the CSV export).
- The API client treats `ACCOUNT_BLOCKED` as a hard logout; the public website's client does not special-case it.
