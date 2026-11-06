import { env } from '@/lib/env'
import type { AuthResponse } from '@/types/api'

export interface FieldIssue {
  field: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly errors?: FieldIssue[]

  constructor(status: number, message: string, code?: string, errors?: FieldIssue[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

// --- Session (the access token lives in memory only) -----------------------

let accessToken: string | null = null
let onSessionRefreshed: ((session: AuthResponse) => void) | null = null
let onAuthFailure: (() => void) | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}
export const getAccessToken = () => accessToken

/** AuthProvider registers these so the client can report session changes. */
export const registerSessionHandlers = (handlers: {
  onRefreshed: (session: AuthResponse) => void
  onFailure: () => void
}) => {
  onSessionRefreshed = handlers.onRefreshed
  onAuthFailure = handlers.onFailure
}

// --- Transport -------------------------------------------------------------

export type Query = Record<string, string | number | boolean | undefined | null>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Query
  signal?: AbortSignal
  /** "blob" for file downloads (CSV export). */
  as?: 'json' | 'blob'
}

export const buildQuery = (query?: Query) => {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

interface ErrorBody {
  message?: string
  code?: string
  errors?: FieldIssue[]
}

const parseError = async (response: Response): Promise<ApiError> => {
  let body: ErrorBody = {}
  try {
    body = (await response.json()) as ErrorBody
  } catch {
    // Non-JSON error (proxy, network edge): fall through to a generic message.
  }
  return new ApiError(
    response.status,
    body.message ?? 'Something went wrong. Please try again.',
    body.code,
    body.errors,
  )
}

const networkError = () =>
  new ApiError(0, 'Cannot reach the server. Check your connection and try again.', 'NETWORK_ERROR')

const send = async <T>(path: string, options: RequestOptions): Promise<T> => {
  let response: Response
  try {
    response = await fetch(`${env.apiUrl}${path}${buildQuery(options.query)}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      signal: options.signal,
      headers: {
        Accept: options.as === 'blob' ? '*/*' : 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw networkError()
  }

  if (!response.ok) throw await parseError(response)
  if (response.status === 204) return undefined as T
  return (options.as === 'blob' ? await response.blob() : await response.json()) as T
}

// --- Refresh (one in-flight request shared by every caller) ----------------

let refreshing: Promise<AuthResponse> | null = null

export const refreshSession = (): Promise<AuthResponse> => {
  refreshing ??= send<AuthResponse>('/auth/refresh', { method: 'POST' })
    .then((session) => {
      accessToken = session.accessToken
      onSessionRefreshed?.(session)
      return session
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

const AUTH_PATHS = ['/auth/refresh', '/auth/login', '/auth/logout']

/** A 401 means the access token is missing or expired: refresh once, then retry once. */
const needsRefresh = (error: unknown, path: string, retried: boolean): boolean =>
  isApiError(error) &&
  error.status === 401 &&
  (error.code === 'TOKEN_INVALID' || error.code === undefined) &&
  !retried &&
  !AUTH_PATHS.includes(path)

const request = async <T>(path: string, options: RequestOptions = {}, retried = false): Promise<T> => {
  try {
    return await send<T>(path, options)
  } catch (error) {
    if (isApiError(error) && error.code === 'ACCOUNT_BLOCKED') {
      accessToken = null
      onAuthFailure?.()
      throw error
    }
    if (!needsRefresh(error, path, retried)) throw error

    try {
      await refreshSession()
    } catch {
      accessToken = null
      onAuthFailure?.()
      throw error
    }
    return request<T>(path, options, true)
  }
}

export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>(path, { method: 'GET', query, signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  blob: (path: string, query?: Query) => request<Blob>(path, { method: 'GET', query, as: 'blob' }),
}
