import { ApiError } from '@/lib/apiClient'
import type { ApiUser } from '@/types/api'

export interface MockUser extends ApiUser {
  password: string
}

export interface MockContext {
  method: string
  query: Record<string, string | number | boolean | undefined | null>
  body: Record<string, unknown>
  token: string | null
  params: Record<string, string>
}

const USERS_KEY = 'vt_mock_users'

// Demo account that always exists: demo@example.com / Passw0rd1
const seedUsers: MockUser[] = [
  {
    id: 'user-demo',
    name: 'Demo Traveller',
    email: 'demo@example.com',
    phone: '+919876500000',
    role: 'USER',
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    password: 'Passw0rd1',
  },
]

// Accounts created while mocking survive a page reload (sessionStorage), so the
// silent session restore works the same way it does against the real API.
const loadUsers = (): MockUser[] => {
  try {
    const saved = sessionStorage.getItem(USERS_KEY)
    return saved ? (JSON.parse(saved) as MockUser[]) : seedUsers
  } catch {
    return seedUsers
  }
}

export const mockUsers: MockUser[] = loadUsers()

export const persistUsers = () => {
  try {
    sessionStorage.setItem(USERS_KEY, JSON.stringify(mockUsers))
  } catch {
    // Storage unavailable: accounts just last until the next reload.
  }
}

/** Any six-digit code is rejected except this one, in every OTP step. */
export const MOCK_OTP = '123456'
export const MOCK_RESET_TOKEN = 'mock-reset-token'

export const wishlistStore = new Map<string, Map<string, string>>()
export const enquiryStore: Record<string, unknown>[] = []

const SESSION_KEY = 'vt_mock_session'

const storage = {
  get: () => {
    try {
      return sessionStorage.getItem(SESSION_KEY)
    } catch {
      return null
    }
  },
  set: (value: string | null) => {
    try {
      if (value) sessionStorage.setItem(SESSION_KEY, value)
      else sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // sessionStorage unavailable: the mock session just will not survive a reload.
    }
  },
}

export const sessionUserId = storage.get
export const setSessionUserId = storage.set

export const tokenFor = (user: MockUser) => `mock-token-${user.id}`

export const publicUser = ({ password: _password, ...user }: MockUser): ApiUser => user

export const findUserByEmail = (email: unknown) =>
  mockUsers.find((user) => user.email === String(email ?? '').trim().toLowerCase())

export const requireUser = (token: string | null): MockUser => {
  if (!token) throw new ApiError(401, 'Missing bearer token')
  const user = mockUsers.find((candidate) => tokenFor(candidate) === token)
  if (!user) throw new ApiError(401, 'Invalid or expired token', 'TOKEN_INVALID')
  return user
}

export const fieldError = (field: string, message: string) =>
  new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', [{ field, message }])

export const page = <T>(items: T[], query: MockContext['query'], defaultLimit: number, maxLimit: number) => {
  const limit = Math.min(Math.max(Number(query.limit) || defaultLimit, 1), maxLimit)
  const current = Math.max(Number(query.page) || 1, 1)
  return {
    data: items.slice((current - 1) * limit, current * limit),
    meta: { page: current, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
  }
}
