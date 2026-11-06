// The only place that reads import.meta.env.

const raw = import.meta.env

export const env = {
  /** Backend base URL including /api. Defaults to the dev proxy. */
  apiUrl: (raw.VITE_API_URL ?? '/api').replace(/\/+$/, ''),
  /** The public website (for "Open public site" and trip links). */
  publicSiteUrl: (raw.VITE_PUBLIC_SITE_URL ?? 'http://localhost:5173').replace(/\/+$/, ''),
} as const
