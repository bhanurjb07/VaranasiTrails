import { Link } from 'react-router'

import { site } from '@/data/site'
import { cn } from '@/lib/cn'

interface LogoProps {
  /** Ivory wordmark for photographs and navy backgrounds. */
  invert?: boolean
  className?: string
}

/** A thin-line diya above the river, drawn in the current text colour. */
export const LogoMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    className={cn('size-7 shrink-0', className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M16 6c2.4 2.7 3.5 4.7 3.5 6.4a3.5 3.5 0 0 1-7 0c0-1.7 1.1-3.7 3.5-6.4Z" />
    <path d="M9 19.5c2.6 2.2 11.4 2.2 14 0" />
    <path d="M6 24.5c3.3 1.4 6.7 1.4 10 0s6.7-1.4 10 0" />
  </svg>
)

export const Logo = ({ invert = false, className }: LogoProps) => (
  <Link
    to="/"
    aria-label={`${site.name} home`}
    className={cn(
      'inline-flex items-center gap-2.5 transition-colors duration-500',
      invert ? 'text-ivory' : 'text-ink',
      className,
    )}
  >
    <LogoMark className={invert ? 'text-ivory' : 'text-brand'} />
    <span className="font-sans text-[1.6rem] leading-none font-bold tracking-tight">
      {site.logoText}
      {site.logoAccent}
    </span>
  </Link>
)
