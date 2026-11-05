import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthResponse } from '@/types/api'
import { ApiError, api, getAccessToken, registerSessionHandlers, setAccessToken } from './apiClient'

const session: AuthResponse = {
  accessToken: 'new-token',
  user: {
    id: 'u1',
    name: 'Asha',
    email: 'asha@example.com',
    phone: '+919876543210',
    role: 'USER',
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

describe('api client refresh logic', () => {
  it('refreshes once on TOKEN_INVALID and retries the request with the new token', async () => {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/auth/refresh')) return json(200, session)
      return authHeader(init) === 'Bearer new-token'
        ? json(200, { ok: true })
        : json(401, { message: 'Invalid or expired token', code: 'TOKEN_INVALID' })
    })

    await expect(api.get('/wishlist')).resolves.toEqual({ ok: true })

    expect(paths()).toEqual(['/wishlist', '/auth/refresh', '/wishlist'])
    expect(getAccessToken()).toBe('new-token')
    expect(onRefreshed).toHaveBeenCalledWith(session)
    expect(onFailure).not.toHaveBeenCalled()
  })

  it('shares one refresh between concurrent failing requests', async () => {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/auth/refresh')) return json(200, session)
      return authHeader(init) === 'Bearer new-token'
        ? json(200, { ok: true })
        : json(401, { message: 'expired', code: 'TOKEN_INVALID' })
    })

    await Promise.all([api.get('/wishlist'), api.get('/users/me'), api.get('/auth/me')])

    expect(paths().filter((path) => path === '/auth/refresh')).toHaveLength(1)
  })

  it('clears the session and reports failure when the refresh is rejected', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('/auth/refresh')
        ? json(401, { message: 'Invalid refresh token', code: 'REFRESH_INVALID' })
        : json(401, { message: 'expired', code: 'TOKEN_INVALID' }),
    )

    await expect(api.get('/wishlist')).rejects.toMatchObject({ status: 401, code: 'TOKEN_INVALID' })

    expect(getAccessToken()).toBeNull()
    expect(onFailure).toHaveBeenCalledTimes(1)
  })

  it('only retries once', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('/auth/refresh') ? json(200, session) : json(401, { message: 'nope', code: 'TOKEN_INVALID' }),
    )

    await expect(api.get('/wishlist')).rejects.toBeInstanceOf(ApiError)

    expect(paths()).toEqual(['/wishlist', '/auth/refresh', '/wishlist'])
  })

  it('does not try to refresh for login failures or other errors', async () => {
    fetchMock.mockResolvedValue(json(401, { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }))
    await expect(api.post('/auth/login', {})).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })

    fetchMock.mockResolvedValue(json(404, { message: 'Not found' }))
    await expect(api.get('/destinations/x')).rejects.toMatchObject({ status: 404 })

    expect(paths().every((path) => path !== '/auth/refresh')).toBe(true)
  })
})

describe('api client basics', () => {
  it('sends credentials, the bearer token and JSON bodies', async () => {
    fetchMock.mockResolvedValue(json(200, { ok: true }))

    await api.post('/enquiries', { name: 'Asha' })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.credentials).toBe('include')
    expect(authHeader(init)).toBe('Bearer old-token')
    expect(init.body).toBe(JSON.stringify({ name: 'Asha' }))
  })

  it('builds query strings and skips empty values', async () => {
    fetchMock.mockResolvedValue(json(200, { data: [] }))

    await api.get('/destinations', { q: 'boat', page: 2, category: undefined, sort: '' })

    expect(String(fetchMock.mock.calls[0]![0])).toBe('/api/destinations?q=boat&page=2')
  })

  it('turns error bodies into ApiError with code and field errors', async () => {
    fetchMock.mockResolvedValue(
      json(422, {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: [{ field: 'email', message: 'Enter a valid email' }],
      }),
    )

    const error = await api.post('/auth/signup', {}).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 422,
      code: 'VALIDATION_ERROR',
      errors: [{ field: 'email', message: 'Enter a valid email' }],
    })
  })

  it('maps network failures to a friendly ApiError and handles 204', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(api.get('/categories')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await expect(api.delete('/destinations/x/reviews/1')).resolves.toBeUndefined()
  })
})
