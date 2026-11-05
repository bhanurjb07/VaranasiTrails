import type { DestinationCard as DestinationCardData } from '@/types/api'
import { DestinationCard } from './DestinationCard'
import { DestinationCardSkeleton } from './DestinationCardSkeleton'

interface DestinationGridProps {
  destinations?: readonly DestinationCardData[]
  loading?: boolean
  skeletonCount?: number
  columns?: 2 | 3
}

const columnClass = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 xl:grid-cols-3',
} as const

export const DestinationGrid = ({
  destinations,
  loading = false,
  skeletonCount = 6,
  columns = 3,
}: DestinationGridProps) => (
  <div className={`grid gap-6 ${columnClass[columns]}`}>
    {loading
      ? Array.from({ length: skeletonCount }, (_, index) => <DestinationCardSkeleton key={index} />)
      : destinations?.map((destination, index) => (
          <DestinationCard key={destination.id} destination={destination} priority={index < 2} />
        ))}
  </div>
)
