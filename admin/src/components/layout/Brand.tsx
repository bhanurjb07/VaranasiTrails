import { cn } from '@/lib/cn'

interface BrandProps {
  compact?: boolean
  className?: string
}

/** Logo mark plus wordmark. */
export const Brand = ({ compact = false, className }: BrandProps) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#E8751A" />
      <path d="M8 28h24" stroke="#1F2A44" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 28c0-6 4-10.5 8-10.5S28 22 28 28" fill="#1F2A44" />
      <circle cx="20" cy="11" r="2.6" fill="#1F2A44" />
    </svg>
    {!compact && (
      <span className="font-heading text-xl font-semibold text-white">
        Varanasi<span className="text-saffron">Trails</span>
        <span className="ml-2 align-middle font-sans text-[0.65rem] font-semibold tracking-[0.18em] text-white/50 uppercase">Admin</span>
      </span>
    )}
  </span>
)
