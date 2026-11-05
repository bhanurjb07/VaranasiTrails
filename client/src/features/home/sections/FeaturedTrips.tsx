import { ArrowRight } from 'lucide-react'

import { ErrorState } from '@/components/common/ErrorState'
import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { DestinationGrid } from '@/features/destinations/components/DestinationGrid'
import { useDestinations } from '@/features/destinations/hooks/useDestinations'

export const FeaturedTrips = () => {
  const featured = useDestinations({ featured: true, sort: 'rating', limit: 3 })
  // If nothing is flagged as featured yet, show the most popular trips instead.
  const needsFallback = featured.isSuccess && featured.data.data.length === 0
  const popular = useDestinations({ sort: 'popular', limit: 3 }, { enabled: needsFallback })

  const active = needsFallback ? popular : featured

  return (
    <section className="py-20 sm:py-28" aria-labelledby="featured-title">
      <Container>
        <SectionHeading
          eyebrow="Handpicked"
          title="Featured trips"
          subtitle="Our most loved ways to spend a day, or a week, in and around Varanasi."
          action={
            <ButtonLink to="/destinations" variant="outline" className="self-start sm:self-end">
              View all trips <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          }
        />
        <h2 id="featured-title" className="sr-only">
          Featured trips
        </h2>

        {active.isError ? (
          <ErrorState error={active.error} title="Could not load trips" onRetry={() => void active.refetch()} />
        ) : (
          <Reveal>
            <DestinationGrid destinations={active.data?.data} loading={active.isPending || (needsFallback && popular.isPending)} skeletonCount={3} />
          </Reveal>
        )}
      </Container>
    </section>
  )
}
