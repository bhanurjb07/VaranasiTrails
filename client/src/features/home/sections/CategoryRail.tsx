import { Compass } from 'lucide-react'
import { Link } from 'react-router'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Skeleton } from '@/components/ui/Skeleton'
import { categoryImageKeys, placeholderImages } from '@/data/placeholderMedia'
import { useCategories } from '@/features/destinations/hooks/useDestinations'

const tile = 'flex size-[4.5rem] items-center justify-center overflow-hidden rounded-control border'
const label = 'mt-2 line-clamp-2 w-[4.75rem] text-center text-sm leading-tight text-ink'

/**
 * Phones only: a swipeable row of category shortcuts right under the hero, like a store app.
 * Tablet and laptop show the larger category tiles further down instead.
 */
export const CategoryRail = () => {
  const { data, isPending } = useCategories()
  if (!isPending && (!data || data.length === 0)) return null

  return (
    <nav aria-label="Browse by category" className="border-b border-line bg-canvas py-4 sm:hidden">
      <ul className="scrollbar-none flex gap-3 overflow-x-auto px-4">
        <li className="shrink-0">
          <Link to="/destinations" className="flex flex-col items-center">
            <span className={`${tile} border-navy bg-navy text-ivory`}>
              <Compass className="size-6" aria-hidden="true" />
            </span>
            <span className={label}>All trips</span>
          </Link>
        </li>
        {isPending
          ? Array.from({ length: 4 }, (_, index) => (
              <li key={index} className="shrink-0">
                <Skeleton className="size-[4.5rem]" />
                <Skeleton className="mx-auto mt-2 h-3 w-14" />
              </li>
            ))
          : data?.map((category) => {
              const image = placeholderImages[categoryImageKeys[category.slug] ?? 'riverBoats']
              return (
                <li key={category.id} className="shrink-0">
                  <Link to={`/destinations?category=${category.slug}`} className="flex flex-col items-center">
                    <span className={`${tile} border-line bg-paper`}>
                      <ImageWithFallback src={image.url} alt="" sizes="80px" className="size-full" />
                    </span>
                    <span className={label}>{category.name}</span>
                  </Link>
                </li>
              )
            })}
      </ul>
    </nav>
  )
}
