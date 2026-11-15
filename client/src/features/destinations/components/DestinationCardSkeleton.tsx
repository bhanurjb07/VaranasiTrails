import { Skeleton } from '@/components/ui/Skeleton'

export const DestinationCardSkeleton = () => (
  <div
    className="flex overflow-hidden rounded-card border border-line/70 bg-surface shadow-card sm:flex-col"
    aria-hidden="true"
  >
    <Skeleton className="w-[38%] shrink-0 rounded-none max-sm:min-h-36 sm:aspect-[4/3] sm:w-auto" />
    <div className="flex-1 space-y-3 p-3 sm:p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-4/5 sm:h-6" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-7 w-28 sm:mt-4 sm:h-8 sm:w-32" />
    </div>
  </div>
)
