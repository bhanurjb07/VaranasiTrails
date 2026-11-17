import type { BadgeVariant } from '@/components/ui/Badge'
import type { HasId } from '@/lib/localStore'

export type BookingStatus = 'enquiry' | 'confirmed' | 'completed' | 'cancelled'
export type BookingSource = 'whatsapp' | 'phone' | 'website' | 'walk-in'

export interface Booking extends HasId {
  customer: string
  phone: string
  email: string
  trip: string
  tripDate: string
  travellers: number | null
  total: number | null
  paid: number | null
  status: BookingStatus
  source: BookingSource
  notes: string
  createdOn: string
}

export const statusOptions = [
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

export const statusVariant: Record<BookingStatus, BadgeVariant> = {
  enquiry: 'info',
  confirmed: 'published',
  completed: 'success',
  cancelled: 'archived',
}

export const sourceOptions = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone call' },
  { value: 'website', label: 'Website form' },
  { value: 'walk-in', label: 'Walk-in' },
] as const

export const sourceLabel = (value: string) => sourceOptions.find((option) => option.value === value)?.label ?? value

export const statusLabel = (value: string) => statusOptions.find((option) => option.value === value)?.label ?? value

export const BOOKINGS_KEY = 'bookings'
export const NO_BOOKINGS: readonly Booking[] = []

const today = () => new Date().toISOString().slice(0, 10)
const offset = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)

export const blankBooking: Omit<Booking, 'id'> = {
  customer: '',
  phone: '',
  email: '',
  trip: '',
  tripDate: offset(7),
  travellers: 2,
  total: null,
  paid: 0,
  status: 'enquiry',
  source: 'whatsapp',
  notes: '',
  createdOn: today(),
}

/** Example rows so the screens can be tried. Offered from the empty state, never added automatically. */
export const sampleBookings = (): Omit<Booking, 'id'>[] => [
  { customer: 'Asha Verma', phone: '+919811100001', email: 'asha@example.com', trip: 'Ganga Aarti and Evening Boat Ride', tripDate: offset(5), travellers: 3, total: 4500, paid: 1500, status: 'confirmed', source: 'whatsapp', notes: 'Prefers front seats.', createdOn: offset(-6) },
  { customer: 'Daniel Brooks', phone: '+447700900123', email: 'daniel@example.com', trip: 'Banarasi Food Trail', tripDate: offset(12), travellers: 2, total: 2000, paid: 0, status: 'enquiry', source: 'website', notes: 'Vegetarian.', createdOn: offset(-2) },
  { customer: 'Meera Nair', phone: '+919822200002', email: '', trip: 'Sarnath Buddhist Day Tour', tripDate: offset(-8), travellers: 4, total: 6400, paid: 6400, status: 'completed', source: 'phone', notes: '', createdOn: offset(-20) },
  { customer: 'Rohit Sharma', phone: '+919833300003', email: 'rohit@example.com', trip: 'Varanasi to Ayodhya and Prayagraj Pilgrimage', tripDate: offset(30), travellers: 5, total: 14995, paid: 5000, status: 'confirmed', source: 'whatsapp', notes: 'Needs pickup from Cantt station.', createdOn: offset(-4) },
  { customer: 'Lena Fischer', phone: '+4915112345678', email: 'lena@example.com', trip: 'Kashi Heritage Walk', tripDate: offset(-15), travellers: 1, total: 1200, paid: 0, status: 'cancelled', source: 'website', notes: 'Cancelled, flight changed.', createdOn: offset(-25) },
  { customer: 'Imran Khan', phone: '+919844400004', email: '', trip: 'Ganga Aarti and Evening Boat Ride', tripDate: offset(-3), travellers: 2, total: 3000, paid: 3000, status: 'completed', source: 'walk-in', notes: '', createdOn: offset(-9) },
]
