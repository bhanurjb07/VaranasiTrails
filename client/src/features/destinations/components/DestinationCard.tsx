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

export const DestinationCard = ({ destination, className, priority = false }: DestinationCardProps) => (
  <article
    className={cn(
      'group relative flex h-full flex-col overflow-hidden rounded-card border border-line/70 bg-surface shadow-card',
      'transition-all duration-300 hover:-translate-y-1 hover:shadow-lift',
      className,
    )}
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
      <ImageWithFallback
        src={destination.coverImage}
        alt={`${destination.title}, ${destination.city}`}
        width={800}
        height={600}
        priority={priority}
        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 45vw, 92vw"
        className="size-full transition-transform duration-500 group-hover:scale-105"
      />
      {destination.discountPercent > 0 && (
        <Badge variant="maroon" className="absolute top-3 left-3 bg-maroon text-white">
          {destination.discountPercent}% off
        </Badge>
      )}
      <WishlistButton destination={destination} className="absolute top-3 right-3 z-10" />
    </div>

    <div className="flex flex-1 flex-col p-5">
      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-saffron-dark uppercase">
        <MapPin className="size-3.5" aria-hidden="true" />
        {destination.city}
      </p>
      <h3 className="mt-1.5 text-xl leading-snug">
        {/* The stretched link makes the whole card clickable without nesting interactive elements. */}
        <Link
          to={`/destinations/${destination.slug}`}
          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {destination.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{destination.tagline}</p>

      <div className="mt-4 flex items-center gap-4 text-sm text-muted">
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden="true" />
          {formatDurationShort(destination.duration)}
        </span>
        <span className="flex items-center gap-1.5">
          <Star className="size-4 fill-gold text-gold" aria-hidden="true" />
          <span className="font-semibold text-indigo">{formatRating(destination.ratingAvg)}</span>
          {destination.ratingCount > 0 && <span>({destination.ratingCount})</span>}
        </span>
      </div>

      <div className="mt-auto flex items-baseline gap-2 border-t border-line/70 pt-4">
        <span className="text-xs text-muted">From</span>
        <span className="font-heading text-2xl font-semibold text-indigo">{formatPrice(destination.priceInr)}</span>
        {destination.originalPriceInr && destination.originalPriceInr > destination.priceInr && (
          <span className="text-sm text-muted line-through">{formatPrice(destination.originalPriceInr)}</span>
        )}
      </div>
    </div>
  </article>
)
