import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export const Card = ({ interactive = false, className, ...props }: CardProps) => (
  <div
    className={cn(
      'rounded-card border border-line/70 bg-surface shadow-card',
      interactive && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lift',
      className,
    )}
    {...props}
  />
)
