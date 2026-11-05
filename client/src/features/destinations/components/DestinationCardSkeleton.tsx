import { Skeleton } from '@/components/ui/Skeleton'

export const DestinationCardSkeleton = () => (
  <div className="overflow-hidden rounded-card border border-line/70 bg-surface shadow-card" aria-hidden="true">
    <Skeleton className="aspect-[4/3] rounded-none" />
    <div className="space-y-3 p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-4 h-8 w-32" />
    </div>
  </div>
)
