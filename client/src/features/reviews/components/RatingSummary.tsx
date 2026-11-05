import { Star } from 'lucide-react'

import { Rating } from '@/components/ui/Rating'
import type { RatingBreakdown } from '@/types/api'

interface RatingSummaryProps {
  average: number
  count: number
  breakdown: RatingBreakdown
}

export const RatingSummary = ({ average, count, breakdown }: RatingSummaryProps) => (
  <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
    <div className="text-center sm:text-left">
      <p className="font-heading text-6xl font-semibold text-indigo">{count > 0 ? average.toFixed(1) : '-'}</p>
      <Rating value={average} size="lg" className="mt-2" />
      <p className="mt-2 text-sm text-muted">
        {count > 0 ? `Based on ${count} review${count === 1 ? '' : 's'}` : 'No reviews yet'}
      </p>
    </div>

    <ul className="space-y-2" aria-label="Rating breakdown">
      {(['5', '4', '3', '2', '1'] as const).map((star) => {
        const total = breakdown[star]
        const percent = count > 0 ? Math.round((total / count) * 100) : 0
        return (
          <li key={star} className="flex items-center gap-3 text-sm">
            <span className="flex w-8 items-center gap-1 font-medium text-indigo">
              {star}
              <Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />
            </span>
            <span
              className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream-deep"
              role="img"
              aria-label={`${total} review${total === 1 ? '' : 's'} with ${star} stars`}
            >
              <span className="block h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
            </span>
            <span className="w-9 text-right text-muted">{total}</span>
          </li>
        )
      })}
    </ul>
  </div>
)
