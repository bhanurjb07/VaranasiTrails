// The only place that reads import.meta.env. Everything else imports `env`.

const raw = import.meta.env

export const env = {
  /** Backend base URL, including /api. Defaults to the dev proxy. */
  apiUrl: (raw.VITE_API_URL ?? '/api').replace(/\/+$/, ''),
  /** When true the API layer serves data from src/mocks instead of the network. */
  useMocks: raw.VITE_USE_MOCKS === 'true',
} as const
