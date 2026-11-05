// Dispatches API calls to mock handlers when VITE_USE_MOCKS=true.
import { ApiError, type RequestOptions } from '@/lib/apiClient'
import { accountHandlers } from './accountHandlers'
import { authHandlers } from './authHandlers'
import { catalogHandlers } from './catalogHandlers'
import type { MockContext } from './state'

type Handler = (context: MockContext) => unknown

interface Route {
  method: string
  pattern: RegExp
  keys: string[]
  handler: Handler
}

const route = (method: string, path: string, handler: Handler): Route => {
  const keys: string[] = []
  const source = path.replace(/:(\w+)/g, (_all, key: string) => {
    keys.push(key)
    return '([^/]+)'
  })
  return { method, pattern: new RegExp(`^${source}$`), keys, handler }
}

const routes: Route[] = [
  route('POST', '/auth/signup', authHandlers.signup),
  route('POST', '/auth/verify-email', authHandlers.verifyEmail),
  route('POST', '/auth/resend-otp', authHandlers.resendOtp),
  route('POST', '/auth/login', authHandlers.login),
  route('POST', '/auth/refresh', authHandlers.refresh),
  route('POST', '/auth/logout', authHandlers.logout),
  route('POST', '/auth/forgot-password', authHandlers.forgotPassword),
  route('POST', '/auth/verify-reset-otp', authHandlers.verifyResetOtp),
  route('POST', '/auth/reset-password', authHandlers.resetPassword),
  route('GET', '/auth/me', authHandlers.me),

  route('GET', '/users/me', accountHandlers.getMe),
  route('PATCH', '/users/me', accountHandlers.updateMe),
  route('POST', '/users/me/change-password', accountHandlers.changePassword),

  route('GET', '/categories', catalogHandlers.categories),
  route('GET', '/destinations', catalogHandlers.list),
  route('GET', '/destinations/:slug', catalogHandlers.detail),
  route('GET', '/destinations/:slug/reviews', catalogHandlers.listReviews),
  route('POST', '/destinations/:slug/reviews', catalogHandlers.createReview),
  route('PATCH', '/destinations/:slug/reviews/:reviewId', catalogHandlers.updateReview),
  route('DELETE', '/destinations/:slug/reviews/:reviewId', catalogHandlers.deleteReview),

  route('GET', '/wishlist', accountHandlers.listWishlist),
  route('PUT', '/wishlist/:destinationId', accountHandlers.addWishlist),
  route('DELETE', '/wishlist/:destinationId', accountHandlers.removeWishlist),

  route('POST', '/enquiries', accountHandlers.createEnquiry),
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const handleMockRequest = async <T>(
  path: string,
  options: RequestOptions & { token: string | null },
): Promise<T> => {
  await delay(180)
  const method = options.method ?? 'GET'

  for (const candidate of routes) {
    if (candidate.method !== method) continue
    const match = candidate.pattern.exec(path)
    if (!match) continue

    const params = Object.fromEntries(
      candidate.keys.map((key, index) => [key, decodeURIComponent(match[index + 1] ?? '')]),
    )
    const result = candidate.handler({
      method,
      params,
      query: options.query ?? {},
      body: (options.body as Record<string, unknown> | undefined) ?? {},
      token: options.token,
    })
    return structuredClone(result) as T
  }

  throw new ApiError(404, `Route not found: ${method} /api${path}`, 'NOT_FOUND')
}
