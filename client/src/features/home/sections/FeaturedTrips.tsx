import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

import { ErrorState } from '@/components/common/ErrorState'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/format'
import { useDestinations } from '@/features/destinations/hooks/useDestinations'
import { WishlistButton } from '@/features/wishlist/components/WishlistButton'
import type { DestinationCard } from '@/types/api'

const TILE_COUNT = 5

// First two tiles share the top row; the rest share the bottom row (three, two or one).
const tileSpan = (index: number, total: number) => {
  if (index < 2) return 'lg:col-span-3'
  const bottom = total - 2
  return bottom === 1 ? 'lg:col-span-6' : bottom === 2 ? 'lg:col-span-3' : 'lg:col-span-2'
}

const Tile = ({ destination, index, total }: { destination: DestinationCard; index: number; total: number }) => (
  <li className={cn('lift group relative h-56 overflow-hidden rounded-lg bg-canvas-alt sm:h-64 lg:h-[21rem]', tileSpan(index, total))}>
    <ImageWithFallback
      src={destination.coverImage}
      alt={`${destination.title}, ${destination.city}`}
      width={1200}
      height={900}
      sizes={index < 2 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'}
      className="absolute inset-0 size-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/10 to-black/55" aria-hidden="true" />

    <div className="absolute inset-x-0 top-0 p-5">
      <h3 className="line-clamp-2 pr-10 font-sans text-xl leading-snug font-bold text-ivory sm:text-2xl">
        {/* The stretched link makes the whole tile clickable without nesting interactive elements. */}
        <Link
          to={`/destinations/${destination.slug}`}
          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {destination.title}
        </Link>
      </h3>
    </div>

    <p className="absolute inset-x-0 bottom-0 p-5 text-sm text-ivory">
      {destination.city}
      <span className="mx-2" aria-hidden="true">
        ·
      </span>
      From <span className="font-bold">{formatPrice(destination.priceInr)}</span>
    </p>

    <WishlistButton destination={destination} className="absolute top-3 right-3 z-10" />
  </li>
)

export const FeaturedTrips = () => {
  const featured = useDestinations({ featured: true, sort: 'rating', limit: TILE_COUNT })
  // If nothing is flagged as featured yet, show the most popular trips instead.
  const needsFallback = featured.isSuccess && featured.data.data.length === 0
  const popular = useDestinations({ sort: 'popular', limit: TILE_COUNT }, { enabled: needsFallback })

  const active = needsFallback ? popular : featured
  const loading = active.isPending || (needsFallback && popular.isPending)
  const destinations = active.data?.data ?? []

  return (
    <section className="bg-canvas py-8 sm:py-12" aria-labelledby="featured-title">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="featured-title" className="font-sans text-2xl font-bold tracking-normal text-ink sm:text-[1.75rem]">
              Featured trips
            </h2>
            <p className="mt-1 text-base text-muted sm:text-lg">A few trips to start with.</p>
          </div>
          <Link
            to="/destinations"
            className="inline-flex shrink-0 items-center gap-1.5 font-medium text-brand-text hover:underline"
          >
            View all trips <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {active.isError ? (
          <div className="mt-5">
            <ErrorState error={active.error} title="Could not load trips" onRetry={() => void active.refetch()} />
          </div>
        ) : (
          <ul className="mt-5 grid gap-4 lg:grid-cols-6" aria-busy={loading}>
            {loading
              ? Array.from({ length: TILE_COUNT }, (_, index) => (
                  <li
                    key={index}
                    className={cn('h-56 animate-pulse rounded-lg bg-canvas-alt sm:h-64 lg:h-[21rem]', tileSpan(index, TILE_COUNT))}
                  />
                ))
              : destinations.map((destination, index) => (
                  <Tile key={destination.id} destination={destination} index={index} total={destinations.length} />
                ))}
          </ul>
        )}
      </Container>
    </section>
  )
}
