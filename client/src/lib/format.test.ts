import { describe, expect, it } from 'vitest'

import {
  formatDifficulty,
  formatDuration,
  formatDurationShort,
  formatPhone,
  formatPrice,
  formatRating,
} from './format'

describe('formatPrice', () => {
  it('uses the rupee sign and Indian digit grouping', () => {
    expect(formatPrice(999)).toBe('₹999')
    expect(formatPrice(1499)).toBe('₹1,499')
    expect(formatPrice(150000)).toBe('₹1,50,000')
  })

  it('never emits a non-breaking space', () => {
    expect(formatPrice(14999)).not.toMatch(/ /)
  })
})

describe('formatDuration', () => {
  it('pluralises days and nights', () => {
    expect(formatDuration({ days: 1, nights: 0 })).toBe('1 day')
    expect(formatDuration({ days: 2, nights: 1 })).toBe('2 days, 1 night')
    expect(formatDuration({ days: 5, nights: 4 })).toBe('5 days, 4 nights')
  })

  it('has a compact form for cards', () => {
    expect(formatDurationShort({ days: 5, nights: 4 })).toBe('5D / 4N')
    expect(formatDurationShort({ days: 1, nights: 0 })).toBe('1 day')
  })
})

describe('other formatters', () => {
  it('formats ratings, difficulty and phones', () => {
    expect(formatRating(4.8)).toBe('4.8')
    expect(formatRating(0)).toBe('New')
    expect(formatDifficulty('HARD')).toBe('Challenging')
    expect(formatPhone('+919876543210')).toBe('+91 98765 43210')
    expect(formatPhone('12345')).toBe('12345')
  })
})
