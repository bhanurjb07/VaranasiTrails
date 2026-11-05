import { ApiError } from '@/lib/apiClient'
import { mockDestinations } from './catalog'
import { catalogHandlers } from './catalogHandlers'
import {
  enquiryStore,
  fieldError,
  persistUsers,
  publicUser,
  requireUser,
  setSessionUserId,
  wishlistStore,
  type MockContext,
} from './state'

const wishlistFor = (userId: string) => {
  let list = wishlistStore.get(userId)
  if (!list) {
    list = new Map()
    wishlistStore.set(userId, list)
  }
  return list
}

export const accountHandlers = {
  getMe: ({ token }: MockContext) => ({ user: publicUser(requireUser(token)) }),

  updateMe: ({ token, body }: MockContext) => {
    const user = requireUser(token)
    if (typeof body.name === 'string') {
      if (body.name.trim().length < 2) throw fieldError('name', 'Name must be at least 2 characters')
      user.name = body.name.trim()
    }
    if (typeof body.phone === 'string') {
      const digits = body.phone.replace(/\D/g, '').slice(-10)
      if (!/^[6-9]\d{9}$/.test(digits)) throw fieldError('phone', 'Enter a valid Indian mobile number')
      user.phone = `+91${digits}`
    }
    persistUsers()
    return { user: publicUser(user) }
  },

  changePassword: ({ token, body }: MockContext) => {
    const user = requireUser(token)
    if (user.password !== body.oldPassword) {
      throw new ApiError(400, 'Current password is incorrect', 'INVALID_PASSWORD')
    }
    user.password = String(body.newPassword ?? '')
    persistUsers()
    setSessionUserId(user.id)
    return { message: 'Password changed. Other sessions have been signed out.' }
  },

  listWishlist: ({ token }: MockContext) => {
    const list = wishlistFor(requireUser(token).id)
    const data = [...list.entries()]
      .map(([id, addedAt]) => {
        const destination = mockDestinations.find((d) => d.id === id)
        return destination ? { ...catalogHandlers.cards(destination), addedAt } : null
      })
      .filter((item) => item !== null)
      .reverse()
    return { data }
  },

  addWishlist: ({ token, params }: MockContext) => {
    const user = requireUser(token)
    if (!mockDestinations.some((d) => d.id === params.destinationId)) {
      throw new ApiError(404, 'Destination not found')
    }
    const list = wishlistFor(user.id)
    if (!list.has(params.destinationId!)) list.set(params.destinationId!, new Date().toISOString())
    return { wishlisted: true }
  },

  removeWishlist: ({ token, params }: MockContext) => {
    wishlistFor(requireUser(token).id).delete(params.destinationId!)
    return { wishlisted: false }
  },

  createEnquiry: ({ body }: MockContext) => {
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    if (message.length < 10) throw fieldError('message', 'Message must be at least 10 characters')
    enquiryStore.push({ ...body, createdAt: new Date().toISOString() })
    return { id: `enq-${enquiryStore.length}`, message: 'Thanks! We will get back to you soon.' }
  },
}
