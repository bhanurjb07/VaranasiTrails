import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export type BadgeVariant = 'neutral' | 'success' | 'info' | 'warning' | 'danger' | 'draft' | 'published' | 'archived'

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-cream-deep text-indigo',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  warning: 'bg-saffron-soft text-saffron-dark',
  danger: 'bg-danger-soft text-danger',
  draft: 'bg-status-draft-bg text-status-draft',
  published: 'bg-status-published-bg text-status-published',
  archived: 'bg-status-archived-bg text-status-archived',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export const Badge = ({ variant = 'neutral', className, ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
      variants[variant],
      className,
    )}
    {...props}
  />
)
