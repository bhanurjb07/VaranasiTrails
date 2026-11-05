import { ApiError } from '@/lib/apiClient'
import type { AuthResponse, MessageResponse } from '@/types/api'
import {
  MOCK_OTP,
  MOCK_RESET_TOKEN,
  fieldError,
  findUserByEmail,
  mockUsers,
  persistUsers,
  publicUser,
  requireUser,
  sessionUserId,
  setSessionUserId,
  tokenFor,
  type MockContext,
  type MockUser,
} from './state'

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const session = (user: MockUser): AuthResponse => {
  setSessionUserId(user.id)
  return { user: publicUser(user), accessToken: tokenFor(user) }
}

const generic: MessageResponse = { message: 'If an account exists for that email, a code has been sent' }

const badOtp = () => new ApiError(400, 'Invalid or expired code', 'OTP_INVALID')

export const authHandlers = {
  signup: ({ body }: MockContext): MessageResponse => {
    const email = text(body.email).toLowerCase()
    const phone = `+91${text(body.phone).replace(/\D/g, '').slice(-10)}`
    if (!/^\S+@\S+\.\S+$/.test(email)) throw fieldError('email', 'Enter a valid email')
    if (text(body.name).length < 2) throw fieldError('name', 'Name must be at least 2 characters')
    if (mockUsers.some((user) => user.email === email || user.phone === phone)) {
      throw new ApiError(409, 'An account with this email or phone number already exists', 'ACCOUNT_EXISTS')
    }
    mockUsers.push({
      id: `user-${mockUsers.length + 1}`,
      name: text(body.name),
      email,
      phone,
      role: 'USER',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      password: String(body.password ?? ''),
    })
    persistUsers()
    return { message: 'Account created. We emailed you a 6-digit code to verify your email.' }
  },

  verifyEmail: ({ body }: MockContext): AuthResponse => {
    const user = findUserByEmail(body.email)
    if (!user || text(body.otp) !== MOCK_OTP) throw badOtp()
    user.emailVerified = true
    persistUsers()
    return session(user)
  },

  resendOtp: (): MessageResponse => generic,
  forgotPassword: (): MessageResponse => generic,

  login: ({ body }: MockContext): AuthResponse => {
    const user = findUserByEmail(body.email)
    if (!user || user.password !== String(body.password ?? '')) {
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
    }
    if (!user.emailVerified) {
      throw new ApiError(403, 'Please verify your email before logging in', 'EMAIL_NOT_VERIFIED')
    }
    return session(user)
  },

  refresh: (): AuthResponse => {
    const user = mockUsers.find((candidate) => candidate.id === sessionUserId())
    if (!user) throw new ApiError(401, 'Invalid refresh token', 'REFRESH_INVALID')
    return session(user)
  },

  logout: (): MessageResponse => {
    setSessionUserId(null)
    return { message: 'Logged out' }
  },

  verifyResetOtp: ({ body }: MockContext) => {
    if (!findUserByEmail(body.email) || text(body.otp) !== MOCK_OTP) throw badOtp()
    return { resetToken: MOCK_RESET_TOKEN }
  },

  resetPassword: ({ body }: MockContext): MessageResponse => {
    const user = findUserByEmail(body.email)
    if (!user || text(body.resetToken) !== MOCK_RESET_TOKEN) {
      throw new ApiError(400, 'Reset token is invalid or has expired', 'RESET_TOKEN_INVALID')
    }
    user.password = String(body.newPassword ?? '')
    persistUsers()
    setSessionUserId(null)
    return { message: 'Password has been reset. Please log in again.' }
  },

  me: ({ token }: MockContext) => ({ user: publicUser(requireUser(token)) }),
}
