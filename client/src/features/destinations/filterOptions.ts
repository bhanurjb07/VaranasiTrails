import type { DestinationSort, Difficulty } from '@/types/api'

export interface RangeOption {
  id: string
  label: string
  min?: number
  max?: number
}

export const priceRanges: readonly RangeOption[] = [
  { id: 'any', label: 'Any price' },
  { id: 'u1000', label: 'Under ₹1,000', max: 999 },
  { id: '1000', label: '₹1,000 to ₹2,500', min: 1000, max: 2500 },
  { id: '2500', label: '₹2,500 to ₹10,000', min: 2501, max: 10000 },
  { id: '10000', label: '₹10,000 and above', min: 10001 },
]

export const durationRanges: readonly RangeOption[] = [
  { id: 'any', label: 'Any length' },
  { id: 'day', label: 'Single day', max: 1 },
  { id: 'short', label: '2 to 3 days', min: 2, max: 3 },
  { id: 'long', label: '4 days or more', min: 4 },
]

export const difficultyOptions: readonly { value: Difficulty | ''; label: string }[] = [
  { value: '', label: 'Any difficulty' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'HARD', label: 'Challenging' },
]

export const sortOptions: readonly { value: DestinationSort; label: string }[] = [
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
]

export const matchRange = (ranges: readonly RangeOption[], min?: number, max?: number) =>
  ranges.find((range) => range.min === min && range.max === max)?.id ?? 'any'
