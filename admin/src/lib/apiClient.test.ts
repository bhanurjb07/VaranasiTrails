import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthResponse } from '@/types/api'
import { ApiError, api, getAccessToken, registerSessionHandlers, setAccessToken } from './apiClient'

const session: AuthResponse = {
  accessToken: 'new-token',
  user: {
    id: 'a1',
    name: 'Admin',
    email: 'admin@example.com',
    phone: '+919000000001',
    role: 'ADMIN',
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const authHeader = (init?: RequestInit) => (init?.headers as Record<string, string> | undefined)?.Authorization

let fetchMock: ReturnType<typeof vi.fn>
const onRefreshed = vi.fn()
const onFailure = vi.fn()

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  onRefreshed.mockClear()
  onFailure.mockClear()
  registerSessionHandlers({ onRefreshed, onFailure })
  setAccessToken('old-token')
})

afterEach(() => vi.unstubAllGlobals())

const paths = () => fetchMock.mock.calls.map(([url]) => String(url).replace('/api', ''))

describe('admin api client: refresh logic', () => {
  it('refreshes once on TOKEN_INVALID and retries with the new token', async () => {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/auth/refresh')) return json(200, session)
      return authHeader(init) === 'Bearer new-token'
        ? json(200, { ok: true })
        : json(401, { message: 'Invalid or expired token', code: 'TOKEN_INVALID' })
    })

    await expect(api.get('/admin/dashboard')).resolves.toEqual({ ok: true })

    expect(paths()).toEqual(['/admin/dashboard', '/auth/refresh', '/admin/dashboard'])
    expect(getAccessToken()).toBe('new-token')
    expect(onRefreshed).toHaveBeenCalledWith(session)
    expect(onFailure).not.toHaveBeenCalled()
  })

  it('shares a single refresh between concurrent failing requests', async () => {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/auth/refresh')) return json(200, session)
      return authHeader(init) === 'Bearer new-token' ? json(200, {}) : json(401, { message: 'expired', code: 'TOKEN_INVALID' })
    })

    await Promise.all([api.get('/admin/users'), api.get('/admin/reviews'), api.get('/admin/dashboard')])

    expect(paths().filter((path) => path === '/auth/refresh')).toHaveLength(1)
  })

  it('clears the session and reports failure when the refresh is rejected', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('/auth/refresh')
        ? json(401, { message: 'Invalid refresh token', code: 'REFRESH_INVALID' })
        : json(401, { message: 'expired', code: 'TOKEN_INVALID' }),
    )

    await expect(api.get('/admin/dashboard')).rejects.toMatchObject({ status: 401, code: 'TOKEN_INVALID' })

    expect(getAccessToken()).toBeNull()
    expect(onFailure).toHaveBeenCalledTimes(1)
  })

  it('only retries once', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('/auth/refresh') ? json(200, session) : json(401, { message: 'nope', code: 'TOKEN_INVALID' }),
    )

    await expect(api.get('/admin/dashboard')).rejects.toBeInstanceOf(ApiError)

    expect(paths()).toEqual(['/admin/dashboard', '/auth/refresh', '/admin/dashboard'])
  })

  it('signs out when the account has been blocked', async () => {
    fetchMock.mockResolvedValue(json(403, { message: 'This account has been blocked.', code: 'ACCOUNT_BLOCKED' }))

    await expect(api.get('/admin/dashboard')).rejects.toMatchObject({ code: 'ACCOUNT_BLOCKED' })

    expect(getAccessToken()).toBeNull()
    expect(onFailure).toHaveBeenCalledTimes(1)
    expect(paths()).toEqual(['/admin/dashboard'])
  })

  it('does not refresh for login failures, 403s or other errors', async () => {
    fetchMock.mockResolvedValue(json(401, { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }))
    await expect(api.post('/auth/login', {})).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })

    fetchMock.mockResolvedValue(json(403, { message: 'Admin access required' }))
    await expect(api.get('/admin/dashboard')).rejects.toMatchObject({ status: 403 })

    expect(paths().every((path) => path !== '/auth/refresh')).toBe(true)
  })
})

describe('admin api client: basics', () => {
  it('sends credentials, the bearer token and JSON bodies', async () => {
    fetchMock.mockResolvedValue(json(200, { ok: true }))

    await api.post('/admin/categories', { name: 'Honeymoon' })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.credentials).toBe('include')
    expect(authHeader(init)).toBe('Bearer old-token')
    expect(init.body).toBe(JSON.stringify({ name: 'Honeymoon' }))
  })

  it('builds query strings and skips empty values', async () => {
    fetchMock.mockResolvedValue(json(200, { data: [] }))

    await api.get('/admin/destinations', { q: 'boat', page: 2, category: undefined, status: '' })

    expect(String(fetchMock.mock.calls[0]![0])).toBe('/api/admin/destinations?q=boat&page=2')
  })

  it('turns error bodies into ApiError with code and field errors', async () => {
    fetchMock.mockResolvedValue(
      json(422, { message: 'Validation failed', code: 'VALIDATION_ERROR', errors: [{ field: 'title', message: 'Add a title' }] }),
    )

    const error = await api.post('/admin/destinations', {}).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 422, code: 'VALIDATION_ERROR', errors: [{ field: 'title', message: 'Add a title' }] })
  })

  it('downloads files as blobs, handles 204 and maps network failures', async () => {
    fetchMock.mockResolvedValueOnce(new Response('a,b\r\n', { status: 200, headers: { 'Content-Type': 'text/csv' } }))
    const blob = await api.blob('/admin/enquiries/export.csv', { status: 'NEW' })
    expect(await blob.text()).toBe('a,b\r\n')
    expect(String(fetchMock.mock.calls[0]![0])).toBe('/api/admin/enquiries/export.csv?status=NEW')

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await expect(api.delete('/admin/enquiries/1')).resolves.toBeUndefined()

    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(api.get('/admin/dashboard')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
  })
})
