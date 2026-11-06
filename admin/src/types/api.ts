// Types mirroring the admin API (see server/README.md, "Admin API").

export type Role = 'USER' | 'ADMIN'
export type Difficulty = 'EASY' | 'MODERATE' | 'HARD'
export type DestinationStatus = 'published' | 'draft' | 'archived'
export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED'

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

export interface FieldError {
  field: string
  message: string
}

// --- Categories ---

export interface AdminCategory {
  id: string
  slug: string
  name: string
  description: string | null
  imageKey: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  destinationCount: number
  createdAt: string
}

// --- Destinations ---

export interface DestinationRow {
  id: string
  slug: string
  title: string
  status: DestinationStatus
  isFeatured: boolean
  priceInr: number
  originalPriceInr: number | null
  category: { id: string; name: string; slug: string }
  city: string
  coverImage: string | null
  updatedAt: string
  publishedAt: string | null
  enquiryCount: number
  wishlistCount: number
}

export interface AdminImage {
  id: string
  key: string
  url: string
  alt: string
  sortOrder: number
  isCover: boolean
  contentType: string
  sizeBytes: number
}

export interface AdminVideo {
  type: 'YOUTUBE' | 'UPLOAD'
  url: string
  key: string | null
}

export interface ItineraryDayInput {
  title: string
  description: string
}

export interface AdminDestination {
  id: string
  slug: string
  title: string
  tagline: string
  overview: string
  categoryId: string
  category: { id: string; slug: string; name: string }
  city: string
  state: string
  country: string
  priceInr: number
  originalPriceInr: number | null
  discountPercent: number
  durationDays: number
  durationNights: number
  maxGroupSize: number
  difficulty: Difficulty
  bestTimeToVisit: string
  meetingPoint: string | null
  metaTitle: string | null
  metaDescription: string | null
  isFeatured: boolean
  isPublished: boolean
  status: DestinationStatus
  publishedAt: string | null
  deletedAt: string | null
  ratingAvg: number
  ratingCount: number
  createdAt: string
  updatedAt: string
  video: AdminVideo | null
  images: AdminImage[]
  highlights: string[]
  itinerary: (ItineraryDayInput & { dayNumber: number })[]
  inclusions: string[]
  exclusions: string[]
  readiness: { ready: boolean; errors: FieldError[] }
}

export interface DestinationListQuery {
  q?: string
  status?: 'all' | DestinationStatus
  category?: string
  featured?: boolean
  sort?: 'updated' | 'newest' | 'title' | 'price_asc' | 'price_desc'
  page?: number
  limit?: number
}

export interface BulkResult {
  action: string
  updated: number
  failed: { id: string; message: string; errors?: FieldError[] }[]
}

export interface PresignResult {
  key: string
  uploadUrl: string
  publicUrl: string
  expiresIn: number
}

// --- Enquiries ---

export interface AdminEnquiry {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: EnquiryStatus
  adminNotes: string | null
  destination: { id: string; title: string; slug: string } | null
  createdAt: string
  updatedAt: string
}

export interface EnquiryList extends Paginated<AdminEnquiry> {
  counts: Record<EnquiryStatus, number>
}

// --- Users ---

export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  emailVerified: boolean
  isBlocked: boolean
  lastLoginAt: string | null
  createdAt: string
  reviewCount: number
  wishlistCount: number
}

// --- Reviews ---

export interface AdminReview {
  id: string
  rating: number
  title: string
  comment: string
  isHidden: boolean
  createdAt: string
  updatedAt: string
  user: { id: string; name: string; email: string }
  destination: { id: string; title: string; slug: string }
}

// --- Dashboard & audit ---

export interface Dashboard {
  destinations: { published: number; draft: number; archived: number; total: number }
  users: { total: number; verified: number; blocked: number; newLast30Days: number }
  enquiries: Record<EnquiryStatus, number> & { total: number }
  enquiriesPerDay: { date: string; count: number }[]
  latestEnquiries: { id: string; name: string; status: EnquiryStatus; destinationTitle: string | null; createdAt: string }[]
  topWishlisted: { id: string; title: string; slug: string; wishlistCount: number }[]
  needsAttention: { id: string; title: string; status: 'published' | 'draft'; issues: string[] }[]
}

export interface AuditEntry {
  id: string
  action: string
  entityType: string
  entityId: string | null
  summary: string
  createdAt: string
  admin: { id: string; name: string; email: string }
}
