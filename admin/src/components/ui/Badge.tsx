import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export type BadgeVariant = 'neutral' | 'success' | 'info' | 'warning' | 'danger' | 'draft' | 'published' | 'archived'

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-canvas-alt text-ink',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  warning: 'bg-canvas-alt text-brand-text',
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
      'inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-sm font-medium whitespace-nowrap',
      variants[variant],
      className,
    )}
    {...props}
  />
)
