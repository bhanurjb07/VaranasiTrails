# Careers

Open positions that the business posts from the admin panel and visitors read on the public website. When nothing is published, the Careers page says there are no open positions.

## How it works

1. An admin creates a listing in the admin panel under **Careers**. It starts as a draft unless "Show on the Careers page" is switched on.
2. A listing is **live** when it is published and its closing date (if any) has not passed. Only live listings reach the public API and the website.
3. The public **Careers** page (`/careers`) lists live roles grouped by department, with department filter buttons when there is more than one department. Each role has its own page (`/careers/:id`) with the full description and an **Apply** button that opens the apply link in a new tab.
4. The footer has a **Careers** link under the Company column.

There is no applicant tracking: applying happens on the link the admin supplies (a form, a job board page or a `mailto:` link).

## Data: `job_listings`

| Column | Type | Notes |
|---|---|---|
| `id` | string (uuid) | primary key |
| `title` | string | the role, for example `Backend Developer` |
| `department` | string | free text, for example `Backend`, `Frontend`, `AI / ML`, `Cybersecurity`. Used to group the public page |
| `location` | string | for example `Varanasi` or `Remote` |
| `employmentType` | enum | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP` |
| `workMode` | enum | `ONSITE`, `REMOTE`, `HYBRID` |
| `experience` | string, optional | for example `2+ years` or `Fresher` |
| `salary` | string, optional | free text, for example `6 to 9 LPA` |
| `aboutRole` | string | what the role is about |
| `responsibilities` | string | one item per line (the API sends and returns an array) |
| `requirements` | string | one item per line (the API sends and returns an array, at least one) |
| `applyUrl` | string | `http://`, `https://` or `mailto:` only |
| `isPublished` | boolean | draft when false |
| `closesAt` | datetime, optional | stored as the end of the chosen day (UTC) |
| `publishedAt` | datetime, optional | set on the first publish and kept when a listing is hidden and shown again |
| `createdAt`, `updatedAt` | datetime | |

## Public API

Both endpoints are public and send `Cache-Control: no-cache`, so a hidden listing disappears from the site on the next load (the 60 second cache used for trips is not applied here).

### GET `/api/careers`

Live listings ordered by department, then newest first.

```json
{
  "data": [
    {
      "id": "6f0c…",
      "title": "Backend Developer",
      "department": "Backend",
      "location": "Varanasi",
      "employmentType": "FULL_TIME",
      "workMode": "HYBRID",
      "experience": "2+ years",
      "salary": null,
      "aboutRole": "You will build and run the APIs…",
      "responsibilities": ["Design REST endpoints"],
      "requirements": ["Node.js and TypeScript"],
      "applyUrl": "https://forms.example.com/backend",
      "closesAt": null,
      "publishedAt": "2026-11-15T03:30:00.000Z"
    }
  ]
}
```

An empty list (`{ "data": [] }`) is a normal answer.

### GET `/api/careers/:id`

`200 { "career": { …same fields… } }`, or `404` when the listing does not exist, is a draft, is hidden or has closed.

## Admin API

All routes need an ADMIN token and are rate limited like the other admin routes. Every change writes an audit row (`career.create`, `career.update`, `career.publish`, `career.unpublish`, `career.delete`, entity type `career`).

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/careers` | List with `q`, `published` (`true` or `false`), `department`, `page`, `limit`. Each row has `status`: `live`, `closed` or `draft` |
| GET | `/api/admin/careers/departments` | Departments already in use, for the form's suggestions |
| POST | `/api/admin/careers` | Create. `isPublished` defaults to false |
| GET | `/api/admin/careers/:id` | One listing |
| PATCH | `/api/admin/careers/:id` | Partial update. `isPublished` shows or hides it |
| DELETE | `/api/admin/careers/:id` | Delete for good (`204`) |

### Create and update body

| Field | Rules |
|---|---|
| `title` | required on create, 3 to 120 characters |
| `department` | required on create, 2 to 80 characters |
| `location` | required on create, 2 to 120 characters |
| `employmentType` | `FULL_TIME` (default), `PART_TIME`, `CONTRACT`, `INTERNSHIP` |
| `workMode` | `ONSITE` (default), `REMOTE`, `HYBRID` |
| `experience`, `salary` | optional, up to 80 characters, `null` or empty clears them |
| `aboutRole` | required on create, 20 to 5000 characters |
| `responsibilities` | optional array, up to 30 items of 1 to 300 characters |
| `requirements` | required on create, 1 to 30 items of 1 to 300 characters |
| `applyUrl` | required on create, up to 500 characters, `http(s)://…` or `mailto:name@host`. `javascript:`, `data:` and other schemes are refused |
| `closesAt` | optional `YYYY-MM-DD`, or `null` to remove the end date |
| `isPublished` | boolean |

Validation failures use the usual `422 VALIDATION_ERROR` with a field list (see [API conventions](06-api-conventions.md)).

## Admin panel

The **Careers** screen (sidebar, between Enquiries and Users) has:

- tabs for All, Published and Drafts, and a search box;
- a table with the role, type, status (Live, Draft or Closed), closing date and an on/off switch that shows or hides the listing on the website;
- **New listing** and an edit button that open a form with every field above (department has suggestions such as Backend, Frontend, Full Stack, AI / ML, Cybersecurity, DevOps; any other name can be typed);
- delete with a confirmation. Hiding a listing is the safer way to take it down for now.

## Public website

| Route | Page |
|---|---|
| `/careers` | Open positions grouped by department. Empty state: "No open positions right now" |
| `/careers/:id` | One role: about, responsibilities, requirements, closing date and the Apply button |

The apply button is only shown for `http(s)` and `mailto:` links, and opens in a new tab with `rel="noopener noreferrer"`. In mock mode (`VITE_USE_MOCKS=true`) there are no listings, so the empty state is shown.

## Tests

`server/tests/careers.test.ts` covers the empty list, draft and published visibility, closing dates, department order, admin-only access, validation, unsafe apply links, editing, deleting, caching and the audit log. `client/src/features/careers/careers.test.tsx` covers the empty state, grouping, the department filter and unsafe links.
