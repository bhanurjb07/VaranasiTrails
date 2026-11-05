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
      'mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
      align === 'center' && 'items-center text-center sm:flex-col sm:items-center',
      className,
    )}
  >
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
      {eyebrow && (
        <p
          className={cn(
            'mb-3 text-xs font-semibold tracking-[0.18em] uppercase',
            invert ? 'text-gold' : 'text-saffron-dark',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={cn('text-balance text-3xl sm:text-4xl', invert && 'text-white')}>{title}</h2>
      {subtitle && <p className={cn('mt-3 text-lg', invert ? 'text-white/75' : 'text-muted')}>{subtitle}</p>}
    </div>
    {action}
  </div>
)
