import { useId } from 'react'
import { Link } from 'react-router'

import { site } from '@/data/site'
import { cn } from '@/lib/cn'

interface LogoProps {
  /** White wordmark for dark backgrounds. */
  invert?: boolean
  className?: string
}

/** Mark: a diya flame above the river at dusk. Colours come from the theme tokens. */
export const LogoMark = ({ className }: { className?: string }) => {
  const id = useId()
  return (
    <svg viewBox="0 0 40 40" className={cn('size-9 shrink-0', className)} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-night-soft)" />
          <stop offset="1" stopColor="var(--color-night-deep)" />
        </linearGradient>
        <linearGradient id={`${id}-flame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-gold)" />
          <stop offset="1" stopColor="var(--color-saffron-bright)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${id}-sky)`} />
      <path d="M20 8.5c3.2 3.6 4.6 6.3 4.6 8.6a4.6 4.6 0 0 1-9.2 0c0-2.3 1.4-5 4.6-8.6Z" fill={`url(#${id}-flame)`} />
      <path d="M11 26.5c3 2.8 15 2.8 18 0" stroke="var(--color-saffron-bright)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path
        d="M9 31.5c3.6 1.6 7.3 1.6 11 0s7.4-1.6 11 0"
        stroke="var(--color-river)"
        strokeOpacity="0.85"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export const Logo = ({ invert = false, className }: LogoProps) => (
  <Link
    to="/"
    aria-label={`${site.name} home`}
    className={cn('inline-flex items-center gap-2.5 font-heading text-2xl font-semibold tracking-tight', className)}
  >
    <LogoMark />
    <span className={cn('transition-colors duration-500', invert ? 'text-white' : 'text-indigo')}>
      {site.logoText}
      <span className={invert ? 'text-glow' : 'text-saffron'}>{site.logoAccent}</span>
    </span>
  </Link>
)
