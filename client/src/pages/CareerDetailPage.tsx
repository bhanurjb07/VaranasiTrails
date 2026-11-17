import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { ErrorState } from '@/components/common/ErrorState'
import { SeoHead } from '@/components/common/SeoHead'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Skeleton } from '@/components/ui/Skeleton'
import { CareerMeta } from '@/features/careers/components/CareerCard'
import { formatClosingDate, safeApplyUrl } from '@/features/careers/labels'
import { useCareer } from '@/features/careers/useCareers'
import { isApiError } from '@/lib/apiClient'
import { NotFoundPage } from './NotFoundPage'

const ListSection = ({ title, items }: { title: string; items: readonly string[] }) =>
  items.length === 0 ? null : (
    <section className="mt-8">
      <h2 className="mb-3 text-2xl">{title}</h2>
      <ul className="list-disc space-y-2 pl-6 text-lg text-ink/90 marker:text-navy">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )

export const CareerDetailPage = () => {
  const { id = '' } = useParams()
  const { data: career, isPending, isError, error, refetch } = useCareer(id)

  if (isPending) {
    return (
      <Container narrow className="space-y-4 py-10" aria-hidden="true">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </Container>
    )
  }

  if (isError) {
    if (isApiError(error) && error.status === 404) return <NotFoundPage subject="position" />
    return (
      <Container narrow className="py-16">
        <ErrorState error={error} title="Could not load this position" onRetry={() => void refetch()} />
      </Container>
    )
  }

  const applyUrl = safeApplyUrl(career.applyUrl)

  return (
    <>
      <SeoHead
        title={`${career.title} (${career.department})`}
        description={`${career.title} at VaranasiTrails. ${career.location}.`}
        path={`/careers/${career.id}`}
      />

      <Container narrow className="py-6 sm:py-12">
        <Link to="/careers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" /> All open positions
        </Link>

        <p className="mt-6 eyebrow">{career.department}</p>
        <h1 className="mt-2 text-balance text-3xl sm:text-5xl">{career.title}</h1>
        <div className="mt-4">
          <CareerMeta career={career} />
        </div>
        {career.closesAt && <p className="mt-3 text-sm text-muted">Apply by {formatClosingDate(career.closesAt)}</p>}

        {applyUrl && (
          <div className="mt-6">
            <ButtonLink href={applyUrl} size="lg">
              Apply for this role
            </ButtonLink>
          </div>
        )}

        <section className="mt-10">
          <h2 className="mb-3 text-2xl">About the role</h2>
          <div className="space-y-4 text-lg leading-relaxed text-ink/90">
            {career.aboutRole.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <ListSection title="Responsibilities" items={career.responsibilities} />
        <ListSection title="Requirements" items={career.requirements} />

        {applyUrl && (
          <div className="mt-10 border-t border-line pt-8">
            <h2 className="text-2xl">How to apply</h2>
            <p className="mt-2 text-muted">Use the link below. It opens in a new tab.</p>
            <div className="mt-5">
              <ButtonLink href={applyUrl} size="lg">
                Apply for this role
              </ButtonLink>
            </div>
          </div>
        )}
      </Container>
    </>
  )
}
