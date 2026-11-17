import { Star } from 'lucide-react'
import { Link } from 'react-router'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { cn } from '@/lib/cn'
import { formatDurationShort, formatPrice, formatRating } from '@/lib/format'
import type { DestinationCard as DestinationCardData } from '@/types/api'
import { WishlistButton } from '@/features/wishlist/components/WishlistButton'

interface DestinationCardProps {
  destination: DestinationCardData
  className?: string
  priority?: boolean
  /** Kept for older callers; every card now has the same shape. */
  feature?: boolean
}

/** A bordered trip card: photo on top, then city, title, a line of text, rating and price. */
export const DestinationCard = ({ destination, className, priority = false }: DestinationCardProps) => {
  const hasOriginal = Boolean(destination.originalPriceInr && destination.originalPriceInr > destination.priceInr)

  return (
    <article className={cn('group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-canvas', className)}>
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-canvas-alt">
        <ImageWithFallback
          src={destination.coverImage}
          alt={`${destination.title}, ${destination.city}`}
          width={1200}
          height={900}
          priority={priority}
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="absolute inset-0 size-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {destination.discountPercent > 0 && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-gold px-2.5 py-1 text-sm font-bold text-navy-deep">
            {destination.discountPercent}% off
          </span>
        )}
        <WishlistButton destination={destination} className="absolute top-3 right-3 z-10" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <p className="text-sm text-muted">
          {destination.city}
          <span className="mx-1.5" aria-hidden="true">
            ·
          </span>
          {formatDurationShort(destination.duration)}
        </p>
        <h3 className="mt-1 line-clamp-2 font-sans text-lg leading-snug font-bold text-ink">
          {/* The stretched link makes the whole card clickable without nesting interactive elements. */}
          <Link
            to={`/destinations/${destination.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-hover:underline"
          >
            {destination.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-base leading-snug text-ink-soft">{destination.tagline}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-sm text-muted">From</span>
            <span className="font-sans text-xl leading-none font-bold text-ink">{formatPrice(destination.priceInr)}</span>
            {hasOriginal && <span className="text-sm text-muted line-through">{formatPrice(destination.originalPriceInr!)}</span>}
          </p>
          <p className="flex items-center gap-1 text-sm text-muted">
            <Star className="size-4 fill-gold text-gold" aria-hidden="true" />
            <span className="font-bold text-ink">{formatRating(destination.ratingAvg)}</span>
            {destination.ratingCount > 0 && <span>({destination.ratingCount})</span>}
          </p>
        </div>
      </div>
    </article>
  )
}
