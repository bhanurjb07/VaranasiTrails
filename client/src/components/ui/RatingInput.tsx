import { Star } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/cn'

interface RatingInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
}

const labels = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']

/** Accessible 1-5 star picker (radio group, arrow-key friendly). */
export const RatingInput = ({ value, onChange, label = 'Your rating' }: RatingInputProps) => {
  const [hover, setHover] = useState(0)
  const shown = hover || value

  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}, ${labels[star - 1]}`}
          tabIndex={value === star || (value === 0 && star === 1) ? 0 : -1}
          onMouseEnter={() => setHover(star)}
          onClick={() => onChange(star)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') onChange(Math.min(5, (value || 0) + 1))
            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') onChange(Math.max(1, (value || 2) - 1))
          }}
          className="rounded p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn('size-8 transition-colors', star <= shown ? 'text-gold' : 'text-line')}
            fill="currentColor"
            strokeWidth={0}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted" aria-live="polite">
        {shown ? labels[shown - 1] : 'Select a rating'}
      </span>
    </div>
  )
}
