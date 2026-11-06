# VaranasiTrails admin panel

A separate single-page app for running the site: trips, photos, categories, enquiries, users, reviews and an audit log. It only talks to `/api/admin/*` and `/api/auth/*` of the VaranasiTrails API (see `server/README.md`, "Admin API").

React 19, Vite, TypeScript (strict), React Router, TanStack Query and Table, Tailwind CSS v4, react-hook-form + zod, `@dnd-kit` (drag to reorder), Recharts, lucide-react and sonner. Fonts: Playfair Display and Inter.

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

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 5174 (proxies `/api` to the API) |
| `npm run build` | Type-check, then production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | oxlint |
| `npm test` | vitest: image compression, CSV helpers, API client refresh logic, YouTube links, publish checklist |

### Environment

Read in one place, `src/lib/env.ts`.

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_URL` | `/api` | API base URL including `/api`. In production use the full URL, for example `https://api.example.com/api`. |
| `VITE_PUBLIC_SITE_URL` | `http://localhost:5173` | The public website, for the "Open public site" and "View on public site" links. |
| `VITE_DEV_PROXY_TARGET` | `http://localhost:5001` | Dev only: where the Vite proxy forwards `/api`. Set it to the API's `PORT` (the server's `.env` may use 5000). |

## Folder map

```
src/
├── app/          App, router (lazy routes), providers, error boundaries
├── pages/        One thin file per route; they compose features
├── features/     auth, dashboard, destinations (list + editor + media), categories,
│                 enquiries, users, reviews
├── components/   ui/ (Button, Modal, Drawer, Table, Switch, SortableList, FileDropzone ...),
│                 layout/ (Sidebar, Topbar, Breadcrumbs, MobileNav, AppShell)
├── lib/          apiClient, env, format, csv, slug, youtube, imageCompress, upload
├── hooks/  types/  styles/
```

## How the main screens work

- **Destination editor** (`/destinations/new`, `/destinations/:id`). A new trip is saved as a **draft** first (nothing is public). Photos and video need a saved draft. The checklist on the right mirrors the server's publish rules, and **Publish** stays disabled until every item is ticked; if edits are unsaved, Publish saves them first. A live trip cannot be edited into an unpublishable state. Leaving with unsaved changes asks first.
- **Photos.** Dropped files are resized to about 2000px and converted to WebP in the browser (target under about 400 KB), then uploaded straight to R2 through a signed URL, with a progress bar per file. Drag to reorder, choose the cover, edit alt text, delete (the file is removed from R2 only when no other trip uses it).
- **Video.** Paste a YouTube link (validated and previewed) or upload an MP4 / WebM (max 50 MB).
- **Preview tab.** Shows the trip the way the public detail page does, built from the unsaved form.
- **Categories.** Drag to reorder, switch off to hide from the public filters, delete only when empty. The image is uploaded the same way as trip photos.
- **Enquiries.** Status tabs with counts, search, date range, a detail drawer (call, WhatsApp and email links, status, internal notes) and **Export CSV** (formula-safe).
- **Users / Reviews.** Blocking signs a user out everywhere. Hiding a review removes it from the public site and from the trip's rating.
- **Audit log.** Every admin action, newest first, grouped by day.

## Deploying to Cloudflare Pages

1. Create a Pages project from the repo. Root directory: `admin`. Build command: `npm run build`. Output directory: `dist`.
2. Environment variables (production): `VITE_API_URL=https://api.example.com/api` and `VITE_PUBLIC_SITE_URL=https://app.example.com`.
3. Add a single-page-app fallback so deep links work: a file `public/_redirects` containing `/* /index.html 200`.
4. On the API: add the admin origin to `CORS_ORIGIN` (together with the public site), set `COOKIE_DOMAIN=.example.com` and keep `COOKIE_SAMESITE=lax` so `admin.example.com` and `api.example.com` share the login cookie. See `server/README.md`.
5. On the R2 bucket: add the admin origin to the bucket CORS policy (JSON in `server/README.md`), otherwise photo uploads are blocked by the browser.

### Protect the admin domain with Cloudflare Access

The login is the main defence, but put a second gate in front of the whole admin site: in Cloudflare Zero Trust, **Access, Applications, Add an application, Self-hosted**, set the domain to `admin.example.com` and add a policy that allows only your team's email addresses. Visitors then pass a one-time-code or SSO check before they even see the login page. Leave the API's domain unprotected by Access (the public site needs it), the API enforces admin roles itself.

## Notes

- The access token lives in memory only; the refresh token is the API's httpOnly cookie. After a reload the app silently refreshes, and one shared refresh serves all parallel requests.
- `@tanstack/react-table` is pinned to v8 (v9 has a different API).
- In dev, Vite sometimes reloads the page the first time you open a screen that pulls in new libraries (its dependency optimiser). It does not happen in production builds.
