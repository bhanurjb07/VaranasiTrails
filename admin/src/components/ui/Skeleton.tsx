import { cn } from '@/lib/cn'

/** Shimmering placeholder block. Size it with className. */
export const Skeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn(
      'relative overflow-hidden rounded-control bg-canvas-alt',
      'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.6s_infinite]',
      'after:bg-gradient-to-r after:from-transparent after:via-paper/70 after:to-transparent',
      className,
    )}
  />
)
