import { Star } from 'lucide-react'

import { cn } from '@/lib/cn'

interface RatingProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'size-3.5', md: 'size-4.5', lg: 'size-6' }

/** Read-only star row with fractional fill. */
export const Rating = ({ value, size = 'md', className }: RatingProps) => (
  <span
    role="img"
    aria-label={`Rated ${value.toFixed(1)} out of 5`}
    className={cn('inline-flex items-center gap-0.5', className)}
  >
    {[0, 1, 2, 3, 4].map((index) => {
      const fill = Math.min(Math.max(value - index, 0), 1)
      return (
        <span key={index} className={cn('relative inline-block', sizes[size])}>
          <Star className={cn('absolute inset-0 text-line', sizes[size])} fill="currentColor" strokeWidth={0} />
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <Star className={cn('text-gold', sizes[size])} fill="currentColor" strokeWidth={0} />
          </span>
        </span>
      )
    })}
  </span>
)
