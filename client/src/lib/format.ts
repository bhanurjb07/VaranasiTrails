const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

/** 1499 -> "₹1,499"; 150000 -> "₹1,50,000" (en-IN grouping). */
export const formatPrice = (amount: number) => inr.format(amount).replace(/ /g, '')

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** { days: 5, nights: 4 } -> "5 days, 4 nights"; { days: 1, nights: 0 } -> "1 day". */
export const formatDuration = (duration: { days: number; nights: number }) =>
  duration.nights > 0
    ? `${plural(duration.days, 'day')}, ${plural(duration.nights, 'night')}`
    : plural(duration.days, 'day')

/** Short form for cards: "5D / 4N" or "1 day". */
export const formatDurationShort = (duration: { days: number; nights: number }) =>
  duration.nights > 0 ? `${duration.days}D / ${duration.nights}N` : plural(duration.days, 'day')

export const formatRating = (rating: number) => (rating > 0 ? rating.toFixed(1) : 'New')

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const difficultyLabels = { EASY: 'Easy', MODERATE: 'Moderate', HARD: 'Challenging' } as const

export const formatDifficulty = (difficulty: keyof typeof difficultyLabels) =>
  difficultyLabels[difficulty]

/** Phone numbers are normalised by the server to +91XXXXXXXXXX. */
export const formatPhone = (phone: string) =>
  phone.startsWith('+91') && phone.length === 13
    ? `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`
    : phone
