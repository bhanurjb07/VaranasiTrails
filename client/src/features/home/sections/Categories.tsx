import { Link } from 'react-router'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Container } from '@/components/layout/Container'
import { Skeleton } from '@/components/ui/Skeleton'
import { categoryImageKeys, placeholderImages } from '@/data/placeholderMedia'
import { useCategories } from '@/features/destinations/hooks/useDestinations'

export const Categories = () => {
  const { data, isPending } = useCategories()

  // Categories are a nice-to-have on the home page: hide the section if they fail.
  if (!isPending && (!data || data.length === 0)) return null

  return (
    <section className="hidden bg-canvas py-8 sm:block sm:py-12" aria-labelledby="categories-title">
      <Container>
        <h2 id="categories-title" className="font-sans text-2xl font-bold tracking-normal text-ink sm:text-[1.75rem]">
          Browse by category
        </h2>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 4 }, (_, index) => (
                <li key={index}>
                  <Skeleton className="h-72 rounded-lg lg:h-[21rem]" />
                </li>
              ))
            : data?.map((category) => {
                const image = placeholderImages[categoryImageKeys[category.slug] ?? 'riverBoats']
                return (
                  <li key={category.id}>
                    <Link
                      to={`/destinations?category=${category.slug}`}
                      className="group relative flex h-72 flex-col justify-between overflow-hidden rounded-lg bg-canvas-alt p-5 lg:h-[21rem]"
                    >
                      <ImageWithFallback
                        src={image.url}
                        alt=""
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="absolute inset-0 size-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                      <span className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/10 to-black/55" aria-hidden="true" />
                      <span className="relative font-sans text-xl leading-snug font-bold text-ivory sm:text-2xl">{category.name}</span>
                      <span className="relative text-sm text-ivory">Browse trips</span>
                    </Link>
                  </li>
                )
              })}
        </ul>
      </Container>
    </section>
  )
}
