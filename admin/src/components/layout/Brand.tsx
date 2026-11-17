import { cn } from '@/lib/cn'

/** A thin-line diya above the river (same mark as the public site), drawn in the current colour. */
export const BrandMark = ({ className }: { className?: string }) => (
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

interface BrandProps {
  compact?: boolean
  className?: string
}

/** Mark plus wordmark, for navy backgrounds (sidebar, login panel). */
export const Brand = ({ compact = false, className }: BrandProps) => (
  <span className={cn('inline-flex items-center gap-2.5 text-ivory', className)}>
    <BrandMark className="text-brand" />
    {!compact && (
      <span className="flex items-baseline gap-2.5">
        <span className="font-sans text-[1.4rem] leading-none font-bold">VaranasiTrails</span>
        <span className="text-sm font-medium text-ivory/60">Admin</span>
      </span>
    )}
  </span>
)
