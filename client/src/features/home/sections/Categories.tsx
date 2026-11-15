import { Link } from 'react-router'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Container } from '@/components/layout/Container'
import { Skeleton } from '@/components/ui/Skeleton'
import { categoryImageKeys, placeholderImages } from '@/data/placeholderMedia'
import { useCategories } from '@/features/destinations/hooks/useDestinations'

export const Categories = () => {
  const { data, isPending } = useCategories()

  // Categories are a nice-to-have on the home page: hide the section if they fail.
  if (!isPending && (!data || data.length === 0)) return null

  return (
    <section className="bg-cream-deep/60 py-8 sm:py-20 md:py-28" aria-labelledby="categories-title">
      <Container>
        <SectionHeading
          eyebrow="Categories"
          title="Browse by category"
        />
        <h2 id="categories-title" className="sr-only">
          Trip categories
        </h2>

        <ul className="scrollbar-none -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 4 }, (_, index) => (
                <li key={index} className="w-36 shrink-0 sm:w-auto">
                  <Skeleton className="aspect-[4/5] rounded-card" />
                </li>
              ))
            : data?.map((category) => {
                const image = placeholderImages[categoryImageKeys[category.slug] ?? 'riverBoats']
                return (
                  <li key={category.id} className="reveal w-36 shrink-0 snap-start sm:w-auto">
                    <div>
                      <Link
                        to={`/destinations?category=${category.slug}`}
                        className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-card shadow-card"
                      >
                        <ImageWithFallback
                          src={image.url}
                          alt=""
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="absolute inset-0 size-full transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/25 to-transparent" />
                        <span className="relative p-3 font-heading text-lg text-white sm:p-5 sm:text-2xl">
                          {category.name}
                          <span className="mt-1 flex items-center gap-1 font-sans text-sm font-medium text-gold">
                            Browse trips
                            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                          </span>
                        </span>
                      </Link>
                    </div>
                  </li>
                )
              })}
        </ul>
      </Container>
    </section>
  )
}
