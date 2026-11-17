import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'

/** Same shape as the card: photo on top, then a few lines. */
export const DestinationCardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('overflow-hidden rounded-lg border border-line', className)} aria-hidden="true">
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-4 h-6 w-28" />
    </div>
  </div>
)
