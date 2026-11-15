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
      'mb-4 flex items-end justify-between gap-3 sm:mb-10 sm:gap-4',
      align === 'center' && 'flex-col items-center text-center',
      className,
    )}
  >
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
      {eyebrow && (
        <p
          className={cn(
            'mb-3 hidden text-xs font-semibold tracking-[0.18em] uppercase sm:block',
            invert ? 'text-gold' : 'text-saffron-dark',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={cn('text-balance text-2xl sm:text-4xl', invert && 'text-white')}>{title}</h2>
      {subtitle && <p className={cn('mt-1 text-sm sm:mt-3 sm:text-lg', invert ? 'text-white/75' : 'text-muted')}>{subtitle}</p>}
    </div>
    {action}
  </div>
)
