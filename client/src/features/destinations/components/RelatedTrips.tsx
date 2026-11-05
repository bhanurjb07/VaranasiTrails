import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'

import { Button } from '@/components/ui/Button'
import type { DestinationCard as DestinationCardData } from '@/types/api'
import { DestinationCard } from './DestinationCard'

/** Horizontal scroll-snap carousel with arrow buttons. */
export const RelatedTrips = ({ destinations }: { destinations: readonly DestinationCardData[] }) => {
  const track = useRef<HTMLUListElement>(null)

  const scroll = (direction: 1 | -1) =>
    track.current?.scrollBy({ left: direction * (track.current.clientWidth * 0.85), behavior: 'smooth' })

  return (
    <div className="relative">
      <div className="mb-4 hidden justify-end gap-2 sm:flex">
        <Button variant="outline" size="sm" aria-label="Scroll left" className="size-10 px-0" onClick={() => scroll(-1)}>
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="sm" aria-label="Scroll right" className="size-10 px-0" onClick={() => scroll(1)}>
          <ChevronRight className="size-5" aria-hidden="true" />
        </Button>
      </div>

      <ul
        ref={track}
        tabIndex={0}
        aria-label="Related trips"
        className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:px-0"
      >
        {destinations.map((destination) => (
          <li key={destination.id} className="w-[78%] shrink-0 snap-start sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.85rem)]">
            <DestinationCard destination={destination} />
          </li>
        ))}
      </ul>
    </div>
  )
}
