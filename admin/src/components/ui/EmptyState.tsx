import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  text?: string
  action?: ReactNode
  className?: string
}

export const EmptyState = ({ icon: Icon, title, text, action, className }: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center rounded-card border border-dashed border-line bg-surface/60 px-6 py-14 text-center',
      className,
    )}
  >
    <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-saffron-soft text-saffron-dark">
      <Icon className="size-6" aria-hidden="true" />
    </span>
    <h3 className="text-lg">{title}</h3>
    {text && <p className="mt-1.5 max-w-sm text-sm text-muted">{text}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
)
