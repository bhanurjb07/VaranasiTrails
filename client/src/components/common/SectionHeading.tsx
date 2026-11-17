import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  action?: ReactNode
  invert?: boolean
  className?: string
}

export const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  action,
  invert = false,
  className,
}: SectionHeadingProps) => (
  <div
    className={cn(
      'mb-5 flex items-end justify-between gap-4',
      align === 'center' && 'flex-col items-center text-center',
      className,
    )}
  >
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
      {eyebrow && <p className={cn('mb-1 text-sm', invert ? 'text-ivory/80' : 'text-muted')}>{eyebrow}</p>}
      <h2 className={cn('text-balance font-sans text-2xl font-bold sm:text-[1.75rem]', invert && 'text-ivory')}>{title}</h2>
      {subtitle && <p className={cn('mt-1 text-base sm:text-lg', invert ? 'text-ivory/80' : 'text-muted')}>{subtitle}</p>}
    </div>
    {action}
  </div>
)
