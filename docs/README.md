# VaranasiTrails Documentation

VaranasiTrails is a trip-planning website for Varanasi and Uttar Pradesh. Visitors browse guided trips, read detailed trip pages, sign up with an email one-time code (OTP), keep a wishlist, leave reviews and start a WhatsApp chat to book. **There is no booking or payment system**: bookings happen on WhatsApp. A separate admin panel lets staff manage trips, photos, categories, enquiries, users, reviews and see an audit log.

This folder is the complete reference for the whole repository. Everything here was written from the source code, so when something in the code changes, update the matching page.

## The three apps

| Folder | What it is | Stack | Default dev address |
|---|---|---|---|
| [`server/`](../server) | REST API (documented here: [API conventions](06-api-conventions.md), [database](04-database.md)) | Node.js, Express 5, TypeScript, Prisma 7 on SQLite / Turso (libSQL), zod, Cloudflare R2, Brevo email | `http://localhost:5001` |
| [`client/`](../client/README.md) | Public website | React 19, Vite, TypeScript, React Router, TanStack Query, Tailwind CSS v4 | `http://localhost:5173` |
| [`admin/`](../admin/README.md) | Admin panel | React 19, Vite, TypeScript, React Router, TanStack Query + Table, Tailwind CSS v4, dnd-kit, Recharts | `http://localhost:5174` |

## Reading order

New to the project? Read 1 to 3 first, then jump to whatever you need.

| # | Page | What you will find |
|---|---|---|
| 1 | [Architecture](01-architecture.md) | How the pieces fit together, request lifecycle, layering, folder maps |
| 2 | [Getting started](02-getting-started.md) | Run everything locally (with and without Docker), seed data, first admin login, mock mode |
| 3 | [Environment variables](03-environment-variables.md) | Every variable for the server, client, admin and Docker, with defaults and validation |
| 4 | [Database](04-database.md) | Every table and column, relationships, cascades, derived fields, migrations, Turso |
| 5 | [Authentication and security](05-authentication-and-security.md) | Signup, OTP, tokens, cookies, refresh rotation, roles, blocking, rate limits |
| 6 | [API conventions](06-api-conventions.md) | Base URL, headers, error format, **every error code**, pagination, validation, caching |
| 7 | [API: Auth](07-api-auth.md) | `/api/auth/*` and `/api/users/*` in full detail |
| 8 | [API: Public catalogue](08-api-public.md) | Destinations, categories, reviews, wishlist, enquiries, health |
| 9 | [API: Admin (overview, categories, audit)](09-api-admin-overview.md) | Dashboard, audit log, categories |
| 10 | [API: Admin destinations](10-api-admin-destinations.md) | Create, edit, publish rules, archive, duplicate, bulk |
| 11 | [API: Admin media](11-api-admin-media.md) | Presigned uploads, images, video, the full upload flow |
| 12 | [API: Admin enquiries, users, reviews](12-api-admin-moderation.md) | Enquiry inbox + CSV, user blocking, review moderation |
| 13 | [Public website (client)](13-client-app.md) | Routes, features, state, auth in the browser, mock mode, editing content |
| 14 | [Admin panel](14-admin-app.md) | Screens, editor flow, upload pipeline, access control |
| 15 | [Deployment](15-deployment.md) | Docker, Cloudflare Pages, Node hosts, Turso, R2, subdomain cookies |
| 16 | [Testing](16-testing.md) | How the three test suites work and what they cover |
| 17 | [Troubleshooting](17-troubleshooting.md) | Symptoms and fixes (including "mock data is not visible") |

## Quick answers

| Question | Answer |
|---|---|
| How do I start everything? | [Getting started](02-getting-started.md) |
| What does endpoint X accept and return? | Pages 7 to 12, one section per endpoint |
| What does error code `Y` mean? | [API conventions, error codes](06-api-conventions.md#error-codes) |
| Why can't I see mock data in the UI? | [Troubleshooting](17-troubleshooting.md#mock-data-is-not-visible-in-the-website) |
| How do photos get uploaded? | [Admin media](11-api-admin-media.md#the-three-step-upload-flow) |
| Which rules must a trip meet before it can be published? | [Admin destinations](10-api-admin-destinations.md#publish-readiness-rules) |
| How do I make someone an admin? | [Getting started](02-getting-started.md#the-first-admin-account) |

## Conventions used in these docs

- `code` formatting is used for paths, endpoints, fields and values.
- "Auth" on an endpoint means a valid `Authorization: Bearer <accessToken>` header.
- Timestamps are ISO 8601 strings in UTC (for example `2026-11-05T18:36:32.000Z`).
- Money is in whole Indian rupees (`priceInr: 1499` means ₹1,499). There are no decimals.
- Phone numbers are Indian mobiles stored as `+91XXXXXXXXXX`.
- "Draft", "published" and "archived" are the three states of a trip. See [Database](04-database.md#trip-lifecycle-states).
