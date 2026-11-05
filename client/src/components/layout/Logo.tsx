import { Link } from 'react-router'

import { site } from '@/data/site'
import { cn } from '@/lib/cn'

interface LogoProps {
  invert?: boolean
  className?: string
}

export const Logo = ({ invert = false, className }: LogoProps) => (
  <Link
    to="/"
    aria-label={`${site.name} home`}
    className={cn('inline-flex items-center gap-2.5 font-heading text-2xl font-semibold', className)}
  >
    <svg viewBox="0 0 40 40" className="size-9" aria-hidden="true">
      <rect width="40" height="40" rx="10" className={invert ? 'fill-white/15' : 'fill-indigo'} />
      <path d="M8 28h24" stroke="#C9962B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 28c0-6 4-10.5 8-10.5S28 22 28 28" fill="#E8751A" />
      <circle cx="20" cy="11" r="2.6" fill="#C9962B" />
    </svg>
    <span className={invert ? 'text-white' : 'text-indigo'}>
      {site.logoText}
      <span className="text-saffron">{site.logoAccent}</span>
    </span>
  </Link>
)
