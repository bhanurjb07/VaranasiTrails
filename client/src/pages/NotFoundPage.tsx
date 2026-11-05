import { Compass } from 'lucide-react'

import { SeoHead } from '@/components/common/SeoHead'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/ButtonLink'

export const NotFoundPage = ({ subject = 'page' }: { subject?: string }) => (
  <Container narrow className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
    <SeoHead title="Page not found" noIndex />
    <span className="flex size-20 items-center justify-center rounded-full bg-saffron-soft text-saffron-dark">
      <Compass className="size-10" aria-hidden="true" />
    </span>
    <p className="mt-6 font-heading text-7xl font-semibold text-saffron">404</p>
    <h1 className="mt-2 text-3xl sm:text-4xl">We could not find that {subject}</h1>
    <p className="mt-3 max-w-md text-muted">
      Like many lanes in Varanasi, this one seems to have led somewhere unexpected. Let us get you back on the path.
    </p>
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <ButtonLink to="/" size="lg">
        Back to home
      </ButtonLink>
      <ButtonLink to="/destinations" variant="outline" size="lg">
        Browse trips
      </ButtonLink>
    </div>
  </Container>
)
