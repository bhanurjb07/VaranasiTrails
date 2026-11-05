import { ApiError } from '@/lib/apiClient'
import type { DestinationCard, DestinationDetail, Review } from '@/types/api'
import { mockCategories, mockDestinations, ratingBaseline, reviewStore } from './catalog'
import { fieldError, mockUsers, page, requireUser, type MockContext } from './state'

const toCard = (d: DestinationDetail): DestinationCard => ({
  id: d.id,
  slug: d.slug,
  title: d.title,
  tagline: d.tagline,
  city: d.city,
  coverImage: d.coverImage,
  priceInr: d.priceInr,
  originalPriceInr: d.originalPriceInr,
  discountPercent: d.discountPercent,
  duration: d.duration,
  ratingAvg: d.ratingAvg,
  ratingCount: d.ratingCount,
})

const num = (value: unknown) => (value === undefined || value === '' ? undefined : Number(value))

const findBySlug = (slug: string | undefined) => {
  const found = mockDestinations.find((d) => d.slug === slug)
  if (!found) throw new ApiError(404, 'Destination not found')
  return found
}

const sorters: Record<string, (a: DestinationDetail, b: DestinationDetail) => number> = {
  price_asc: (a, b) => a.priceInr - b.priceInr,
  price_desc: (a, b) => b.priceInr - a.priceInr,
  rating: (a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  popular: (a, b) => b.ratingCount - a.ratingCount || b.ratingAvg - a.ratingAvg,
}

const recompute = (destination: DestinationDetail) => {
  const reviews = reviewStore[destination.slug] ?? []
  const base = ratingBaseline[destination.slug] ?? { count: 0, sum: 0, breakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } }
  const count = base.count + reviews.length
  const sum = base.sum + reviews.reduce((total, r) => total + r.rating, 0)

  destination.ratingCount = count
  destination.ratingAvg = count ? Math.round((sum / count) * 10) / 10 : 0

  const breakdown = { ...base.breakdown }
  for (const review of reviews) breakdown[String(review.rating) as keyof typeof breakdown] += 1
  destination.ratingBreakdown = breakdown
}

const stripOwner = ({ userId: _userId, ...review }: Review & { userId?: string }): Review => review

const sortedReviews = (slug: string) =>
  [...(reviewStore[slug] ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

const validateReview = (body: MockContext['body'], partial: boolean) => {
  const rating = body.rating === undefined ? undefined : Number(body.rating)
  const title = typeof body.title === 'string' ? body.title.trim() : undefined
  const comment = typeof body.comment === 'string' ? body.comment.trim() : undefined
  if ((!partial || rating !== undefined) && !(Number.isInteger(rating) && rating! >= 1 && rating! <= 5)) {
    throw fieldError('rating', 'Rating must be 1-5')
  }
  if ((!partial || title !== undefined) && (title?.length ?? 0) < 3) {
    throw fieldError('title', 'Title must be at least 3 characters')
  }
  if ((!partial || comment !== undefined) && (comment?.length ?? 0) < 10) {
    throw fieldError('comment', 'Comment must be at least 10 characters')
  }
  return { rating, title, comment }
}

export const catalogHandlers = {
  categories: () => ({ data: mockCategories }),

  list: ({ query }: MockContext) => {
    const q = String(query.q ?? '').toLowerCase()
    const minPrice = num(query.minPrice)
    const maxPrice = num(query.maxPrice)
    const minDays = num(query.minDays)
    const maxDays = num(query.maxDays)

    const filtered = mockDestinations
      .filter((d) => !q || d.title.toLowerCase().includes(q) || d.city.toLowerCase().includes(q))
      .filter((d) => !query.category || d.category.slug === query.category)
      .filter((d) => minPrice === undefined || d.priceInr >= minPrice)
      .filter((d) => maxPrice === undefined || d.priceInr <= maxPrice)
      .filter((d) => minDays === undefined || d.duration.days >= minDays)
      .filter((d) => maxDays === undefined || d.duration.days <= maxDays)
      .filter((d) => !query.difficulty || d.difficulty === query.difficulty)
      .filter((d) => query.featured === undefined || String(d.isFeatured) === String(query.featured))
      .sort(sorters[String(query.sort ?? 'popular')] ?? sorters.popular!)

    const result = page(filtered, query, 12, 24)
    return { data: result.data.map(toCard), meta: result.meta }
  },

  detail: ({ params }: MockContext) => {
    const destination = findBySlug(params.slug)
    const related = mockDestinations
      .filter(
        (d) =>
          d.id !== destination.id &&
          (d.category.id === destination.category.id || d.city === destination.city),
      )
      .sort(sorters.rating!)
      .slice(0, 6)
      .map(toCard)

    return {
      destination: {
        ...destination,
        latestReviews: sortedReviews(destination.slug).slice(0, 5).map(stripOwner),
        related,
      },
    }
  },

  listReviews: ({ params, query }: MockContext) => {
    const destination = findBySlug(params.slug)
    const result = page(sortedReviews(destination.slug), query, 10, 50)
    return { data: result.data.map(stripOwner), meta: result.meta }
  },

  createReview: ({ params, body, token }: MockContext) => {
    const user = requireUser(token)
    if (!user.emailVerified) throw new ApiError(403, 'Please verify your email first', 'EMAIL_NOT_VERIFIED')
    const destination = findBySlug(params.slug)
    const reviews = (reviewStore[destination.slug] ??= [])
    if (reviews.some((r) => r.userId === user.id)) {
      throw new ApiError(409, 'You have already reviewed this destination', 'REVIEW_EXISTS')
    }

    const { rating, title, comment } = validateReview(body, false)
    const now = new Date().toISOString()
    const review = {
      id: `rev-${Date.now()}`,
      userId: user.id,
      rating: rating!,
      title: title!,
      comment: comment!,
      createdAt: now,
      updatedAt: now,
      user: { name: mockUsers.find((u) => u.id === user.id)?.name ?? user.name },
    }
    reviews.push(review)
    recompute(destination)
    return { review: stripOwner(review) }
  },

  updateReview: ({ params, body, token }: MockContext) => {
    const user = requireUser(token)
    const destination = findBySlug(params.slug)
    const review = reviewStore[destination.slug]?.find((r) => r.id === params.reviewId && r.userId === user.id)
    if (!review) throw new ApiError(404, 'Review not found')

    const { rating, title, comment } = validateReview(body, true)
    if (rating !== undefined) review.rating = rating
    if (title !== undefined) review.title = title
    if (comment !== undefined) review.comment = comment
    review.updatedAt = new Date().toISOString()
    recompute(destination)
    return { review: stripOwner(review) }
  },

  deleteReview: ({ params, token }: MockContext) => {
    const user = requireUser(token)
    const destination = findBySlug(params.slug)
    const reviews = reviewStore[destination.slug] ?? []
    const index = reviews.findIndex((r) => r.id === params.reviewId && r.userId === user.id)
    if (index === -1) throw new ApiError(404, 'Review not found')
    reviews.splice(index, 1)
    recompute(destination)
    return undefined
  },

  cards: toCard,
}
