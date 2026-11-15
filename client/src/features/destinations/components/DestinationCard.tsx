import { Clock, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { formatDurationShort, formatPrice, formatRating } from '@/lib/format'
import type { DestinationCard as DestinationCardData } from '@/types/api'
import { WishlistButton } from '@/features/wishlist/components/WishlistButton'

interface DestinationCardProps {
  destination: DestinationCardData
  className?: string
  priority?: boolean
}

/** A list row (photo left, details right) on phones; a vertical card from sm up. */
export const DestinationCard = ({ destination, className, priority = false }: DestinationCardProps) => (
  <article
    className={cn(
      'group relative flex h-full overflow-hidden rounded-card border border-line/70 bg-surface shadow-card sm:flex-col',
      'transition-shadow duration-300 sm:hover:shadow-lift',
      className,
    )}
  >
    <div className="relative w-[38%] shrink-0 overflow-hidden bg-cream-deep max-sm:min-h-36 sm:aspect-[4/3] sm:w-auto">
      <ImageWithFallback
        src={destination.coverImage}
        alt={`${destination.title}, ${destination.city}`}
        width={800}
        height={600}
        priority={priority}
        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 45vw, 38vw"
        className="size-full"
      />
      {destination.discountPercent > 0 && (
        <Badge variant="maroon" className="absolute top-2 left-2 bg-maroon text-white sm:top-3 sm:left-3">
          {destination.discountPercent}% off
        </Badge>
      )}
      <WishlistButton destination={destination} className="absolute top-2 right-2 z-10 sm:top-3 sm:right-3" />
    </div>

    <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
      <p className="flex items-center gap-1 text-[0.7rem] font-semibold tracking-wide text-saffron-dark uppercase sm:gap-1.5 sm:text-xs">
        <MapPin className="size-3.5" aria-hidden="true" />
        {destination.city}
      </p>
      <h3 className="mt-1 line-clamp-2 text-base leading-snug sm:mt-1.5 sm:text-xl">
        {/* The stretched link makes the whole card clickable without nesting interactive elements. */}
        <Link
          to={`/destinations/${destination.slug}`}
          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {destination.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted max-sm:hidden">{destination.tagline}</p>

      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted sm:mt-4 sm:gap-4 sm:text-sm">
        <span className="flex items-center gap-1 sm:gap-1.5">
          <Clock className="size-3.5 sm:size-4" aria-hidden="true" />
          {formatDurationShort(destination.duration)}
        </span>
        <span className="flex items-center gap-1 sm:gap-1.5">
          <Star className="size-3.5 fill-gold text-gold sm:size-4" aria-hidden="true" />
          <span className="font-semibold text-indigo">{formatRating(destination.ratingAvg)}</span>
          {destination.ratingCount > 0 && <span>({destination.ratingCount})</span>}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2 sm:border-t sm:border-line/70 sm:pt-4">
        <span className="text-xs text-muted">From</span>
        <span className="font-heading text-xl font-semibold text-indigo sm:text-2xl">
          {formatPrice(destination.priceInr)}
        </span>
        {destination.originalPriceInr && destination.originalPriceInr > destination.priceInr && (
          <span className="text-xs text-muted line-through sm:text-sm">{formatPrice(destination.originalPriceInr)}</span>
        )}
      </div>
    </div>
  </article>
)
