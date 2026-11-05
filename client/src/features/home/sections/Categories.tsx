import { Link } from 'react-router'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Reveal } from '@/components/common/Reveal'
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
    <section className="bg-cream-deep/60 py-20 sm:py-28" aria-labelledby="categories-title">
      <Container>
        <SectionHeading
          eyebrow="Explore by interest"
          title="Find the trip that fits you"
          subtitle="Rituals at dawn, stories in stone, or the best breakfast of your life."
        />
        <h2 id="categories-title" className="sr-only">
          Trip categories
        </h2>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 4 }, (_, index) => (
                <li key={index}>
                  <Skeleton className="aspect-[4/5] rounded-card" />
                </li>
              ))
            : data?.map((category, index) => {
                const image = placeholderImages[categoryImageKeys[category.slug] ?? 'riverBoats']
                return (
                  <li key={category.id}>
                    <Reveal delay={index * 0.08}>
                      <Link
                        to={`/destinations?category=${category.slug}`}
                        className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-card shadow-card"
                      >
                        <ImageWithFallback
                          src={image.url}
                          alt=""
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="absolute inset-0 size-full transition-transform duration-700 group-hover:scale-110"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-indigo/90 via-indigo/20 to-transparent" />
                        <span className="relative p-5 font-heading text-2xl text-white">
                          {category.name}
                          <span className="mt-1 block font-sans text-sm font-medium text-gold transition-transform group-hover:translate-x-1">
                            Browse trips
                          </span>
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                )
              })}
        </ul>
      </Container>
    </section>
  )
}
