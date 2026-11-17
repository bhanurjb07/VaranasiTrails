import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type BadgeVariant = 'neutral' | 'brand' | 'success'

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-canvas-alt text-ink',
  brand: 'bg-canvas-alt text-brand-text',
  success: 'bg-success/12 text-success',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export const Badge = ({ variant = 'neutral', className, ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-medium',
      variants[variant],
      className,
    )}
    {...props}
  />
)
