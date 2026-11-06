const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

/** 1499 -> "₹1,499"; 150000 -> "₹1,50,000" (en-IN grouping). */
export const formatPrice = (amount: number) => inr.format(amount).replace(/ /g, '')

export const discountPercent = (price: number, original: number | null | undefined) =>
  original && original > price ? Math.round(((original - price) / original) * 100) : 0

export const formatDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatDateTime = (iso: string | Date) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

/** "5 minutes ago", "yesterday", falling back to a date after a week. */
export const timeAgo = (iso: string | Date, now: Date = new Date()): string => {
  const seconds = Math.round((now.getTime() - new Date(iso).getTime()) / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return formatDate(iso)
}

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** 1 -> "1 day"; (5, 4) -> "5 days, 4 nights". */
export const formatDuration = (days: number, nights: number) => {
  const d = `${days} day${days === 1 ? '' : 's'}`
  return nights > 0 ? `${d}, ${nights} night${nights === 1 ? '' : 's'}` : d
}
