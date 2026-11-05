import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/cn'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}

const pagesToShow = (page: number, total: number): (number | 'gap')[] => {
  const wanted = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total))
  const sorted = [...wanted].sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  sorted.forEach((p, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined && p - previous > 1) result.push('gap')
    result.push(p)
  })
  return result
}

const itemStyles =
  'inline-flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-colors'

export const Pagination = ({ page, totalPages, onChange, className }: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={cn(itemStyles, 'text-indigo hover:bg-cream-deep disabled:opacity-40')}
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      {pagesToShow(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-muted" aria-hidden="true">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
            className={cn(itemStyles, item === page ? 'bg-indigo text-white' : 'text-indigo hover:bg-cream-deep')}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={cn(itemStyles, 'text-indigo hover:bg-cream-deep disabled:opacity-40')}
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </nav>
  )
}
