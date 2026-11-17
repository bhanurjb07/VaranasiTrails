import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export const Card = ({ interactive = false, className, ...props }: CardProps) => (
  <div
    className={cn(
      'rounded-card border border-line/80 bg-paper ',
      interactive && 'lift',
      className,
    )}
    {...props}
  />
)
