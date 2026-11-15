import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type BadgeVariant = 'neutral' | 'saffron' | 'success'

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-cream-deep text-indigo',
  saffron: 'bg-saffron-soft text-saffron-dark',
  success: 'bg-success/12 text-success',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export const Badge = ({ variant = 'neutral', className, ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
      variants[variant],
      className,
    )}
    {...props}
  />
)
