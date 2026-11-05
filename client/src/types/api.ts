// Types mirroring the server responses (see server/README.md).

export type Role = 'USER' | 'ADMIN'
export type Difficulty = 'EASY' | 'MODERATE' | 'HARD'
export type OtpPurpose = 'EMAIL_VERIFY' | 'PASSWORD_RESET'

export interface ApiUser {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  emailVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  user: ApiUser
  accessToken: string
}

export interface MessageResponse {
  message: string
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PageMeta
}

export interface Duration {
  days: number
  nights: number
}

export interface Category {
  id: string
  slug: string
  name: string
}

export interface DestinationCard {
  id: string
  slug: string
  title: string
  tagline: string
  city: string
  coverImage: string | null
  priceInr: number
  originalPriceInr: number | null
  discountPercent: number
  duration: Duration
  ratingAvg: number
  ratingCount: number
}

export interface GalleryImage {
  url: string
  alt: string
  isCover: boolean
}

export interface ItineraryDay {
  dayNumber: number
  title: string
  description: string
}

export type RatingBreakdown = Record<'1' | '2' | '3' | '4' | '5', number>

export interface Review {
  id: string
  rating: number
  title: string
  comment: string
  createdAt: string
  updatedAt: string
  user: { name: string }
}

export interface DestinationDetail extends DestinationCard {
  overview: string
  state: string
  country: string
  category: Category
  maxGroupSize: number
  difficulty: Difficulty
  bestTimeToVisit: string
  meetingPoint: string | null
  videoUrl: string | null
  isFeatured: boolean
  ratingBreakdown: RatingBreakdown
  images: GalleryImage[]
  highlights: string[]
  itinerary: ItineraryDay[]
  inclusions: string[]
  exclusions: string[]
  latestReviews: Review[]
  related: DestinationCard[]
  createdAt: string
  updatedAt: string
}

export type DestinationSort = 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular'

export interface DestinationFilters {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  minDays?: number
  maxDays?: number
  difficulty?: Difficulty
  featured?: boolean
  sort?: DestinationSort
  page?: number
  limit?: number
}

export interface WishlistItem extends DestinationCard {
  addedAt: string
}

export interface EnquiryInput {
  name: string
  email: string
  phone: string
  destinationId?: string
  message: string
}

/** Server error codes the UI reacts to. */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_EXISTS'
  | 'PHONE_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'OTP_INVALID'
  | 'RESET_TOKEN_INVALID'
  | 'RATE_LIMITED'
  | 'REVIEW_EXISTS'
  | 'TOKEN_INVALID'
  | 'REFRESH_INVALID'
  | 'REFRESH_REUSED'
  | 'INVALID_PASSWORD'
  | 'EMAIL_SEND_FAILED'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
