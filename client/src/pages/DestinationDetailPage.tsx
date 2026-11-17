import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { SeoHead } from '@/components/common/SeoHead'
import { Container } from '@/components/layout/Container'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { ErrorState } from '@/components/common/ErrorState'
import { useAuth } from '@/features/auth/useAuth'
import { BuyBox } from '@/features/destinations/components/BuyBox'
import { DetailSkeleton } from '@/features/destinations/components/DetailSkeleton'
import { Gallery } from '@/features/destinations/components/Gallery'
import { HighlightsList } from '@/features/destinations/components/HighlightsList'
import { InclusionsList } from '@/features/destinations/components/InclusionsList'
import { Itinerary } from '@/features/destinations/components/Itinerary'
import { RelatedTrips } from '@/features/destinations/components/RelatedTrips'
import { SectionNav, type SectionLink } from '@/features/destinations/components/SectionNav'
import { StickyMobileBar } from '@/features/destinations/components/StickyMobileBar'
import { useDestination } from '@/features/destinations/hooks/useDestinations'
import { EnquiryModal } from '@/features/enquiry/components/EnquiryModal'
import { RatingSummary } from '@/features/reviews/components/RatingSummary'
import { ReviewComposer } from '@/features/reviews/components/ReviewComposer'
import { ReviewList } from '@/features/reviews/components/ReviewList'
import { isApiError } from '@/lib/apiClient'
import { formatDuration } from '@/lib/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { NotFoundPage } from './NotFoundPage'

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-44 py-6 md:scroll-mt-32 md:py-10">
    <h2 id={`${id}-title`} className="mb-4 font-sans text-2xl font-bold text-ink">
      {title}
    </h2>
    {children}
  </section>
)

export const DestinationDetailPage = () => {
  const { slug = '' } = useParams()
  const { user } = useAuth()
  const { data: d, isPending, isError, error, refetch } = useDestination(slug)
  const [enquiry, setEnquiry] = useState(false)

  if (isPending) return <DetailSkeleton />

  if (isError) {
    if (isApiError(error) && error.status === 404) return <NotFoundPage subject="trip" />
    return (
      <Container className="py-16">
        <ErrorState error={error} title="Could not load this trip" onRetry={() => void refetch()} />
      </Container>
    )
  }

  const whatsappUrl = buildWhatsAppUrl('destinationEnquiry', {
    destination: d.title,
    duration: formatDuration(d.duration),
    price: d.priceInr.toLocaleString('en-IN'),
    url: `${window.location.origin}/destinations/${d.slug}`,
    name: user?.name,
  })

  const sections: SectionLink[] = [
    { id: 'overview', label: 'Overview' },
    ...(d.highlights.length > 0 ? [{ id: 'highlights', label: 'Highlights' }] : []),
    ...(d.itinerary.length > 0 ? [{ id: 'itinerary', label: 'Itinerary' }] : []),
    { id: 'included', label: 'Included' },
    { id: 'reviews', label: `Reviews (${d.ratingCount})` },
    ...(d.related.length > 0 ? [{ id: 'related', label: 'Related trips' }] : []),
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: d.title,
    description: d.tagline,
    image: d.images.map((image) => image.url),
    touristType: d.category.name,
    offers: { '@type': 'Offer', priceCurrency: 'INR', price: d.priceInr, availability: 'https://schema.org/InStock' },
    ...(d.ratingCount > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: d.ratingAvg, reviewCount: d.ratingCount } }
      : {}),
  }

  return (
    <>
      <SeoHead
        title={d.title}
        description={`${d.tagline}. ${formatDuration(d.duration)} from Rs ${d.priceInr.toLocaleString('en-IN')}. ${d.city}, ${d.state}.`}
        image={d.images[0]?.url}
        path={`/destinations/${d.slug}`}
        jsonLd={jsonLd}
      />

      <Container className="pb-28 lg:pb-12">
        <nav aria-label="Breadcrumb" className="py-5 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-ink hover:underline">
                Home
              </Link>
            </li>
            <ChevronRight className="size-4" aria-hidden="true" />
            <li>
              <Link to="/destinations" className="hover:text-ink hover:underline">
                Trips
              </Link>
            </li>
            <ChevronRight className="size-4" aria-hidden="true" />
            <li aria-current="page" className="font-medium text-ink">
              {d.title}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          {/* min-w-0: grid items must be allowed to shrink below their scrollable content. */}
          <div className="min-w-0">
            <Gallery images={d.images} title={d.title} videoUrl={d.videoUrl} />
          </div>
          <div className="min-w-0 lg:sticky lg:top-24">
            <BuyBox destination={d} whatsappUrl={whatsappUrl} onEnquire={() => setEnquiry(true)} />
          </div>
        </div>

        <div className="mt-10 max-w-5xl">
          <SectionNav sections={sections} />

          <Section id="overview" title="Overview">
            <div className="space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg">
              {d.overview.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Section>

          {d.highlights.length > 0 && (
            <Section id="highlights" title="Highlights">
              <HighlightsList highlights={d.highlights} />
            </Section>
          )}

          {d.itinerary.length > 0 && (
            <Section id="itinerary" title="Day-by-day itinerary">
              <Itinerary days={d.itinerary} />
            </Section>
          )}

          <Section id="included" title="Included and not included">
            <InclusionsList inclusions={d.inclusions} exclusions={d.exclusions} />
          </Section>

          <Section id="reviews" title="Traveller reviews">
            <div className="space-y-10">
              <RatingSummary average={d.ratingAvg} count={d.ratingCount} breakdown={d.ratingBreakdown} />
              <ReviewComposer slug={d.slug} />
              <ReviewList slug={d.slug} />
            </div>
          </Section>

          {d.related.length > 0 && (
            <Section id="related" title="You might also like">
              <RelatedTrips destinations={d.related} />
            </Section>
          )}

          <div className="mt-6 rounded-lg bg-navy p-8 text-center text-ivory">
            <h2 className="font-sans text-2xl font-bold text-ivory sm:text-3xl">Still deciding?</h2>
            <p className="mx-auto mt-2 max-w-md text-ivory/90">
              Ask us anything about this trip, dates, group sizes or custom plans.
            </p>
            <button type="button" onClick={() => setEnquiry(true)} className={`${buttonStyles('primary', 'lg')} mt-6`}>
              Send an enquiry
            </button>
          </div>
        </div>
      </Container>

      <StickyMobileBar priceInr={d.priceInr} originalPriceInr={d.originalPriceInr} whatsappUrl={whatsappUrl} />
      <EnquiryModal open={enquiry} onClose={() => setEnquiry(false)} destination={{ id: d.id, title: d.title }} />
    </>
  )
}
