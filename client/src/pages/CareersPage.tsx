import { Briefcase } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PageHeader } from '@/components/common/PageHeader'
import { SeoHead } from '@/components/common/SeoHead'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Skeleton } from '@/components/ui/Skeleton'
import { CareerCard } from '@/features/careers/components/CareerCard'
import { useCareers } from '@/features/careers/useCareers'
import { cn } from '@/lib/cn'
import type { Career } from '@/types/api'

const chip = (active: boolean) =>
  cn(
    'rounded-md border px-3.5 py-1.5 text-sm font-medium transition-colors',
    active ? 'border-indigo bg-indigo text-cream' : 'border-line bg-surface text-indigo hover:border-indigo/50',
  )

export const CareersPage = () => {
  const { data, isPending, isError, error, refetch } = useCareers()
  const [params, setParams] = useSearchParams()

  const departments = useMemo(() => [...new Set((data ?? []).map((career) => career.department))], [data])
  const requested = params.get('department')
  // An unknown department in the address (for example a role that was just closed) shows everything.
  const department = requested && departments.includes(requested) ? requested : null

  const groups = useMemo(() => {
    const shown = (data ?? []).filter((career) => !department || career.department === department)
    const byDepartment = new Map<string, Career[]>()
    for (const career of shown) byDepartment.set(career.department, [...(byDepartment.get(career.department) ?? []), career])
    return [...byDepartment.entries()]
  }, [data, department])

  const choose = (next: string | null) =>
    setParams(next ? { department: next } : {}, { preventScrollReset: true })

  return (
    <>
      <SeoHead
        title="Careers"
        description="Open positions at VaranasiTrails, with the role, requirements and how to apply."
        path="/careers"
      />
      <PageHeader
        eyebrow="Careers"
        title="Open positions"
        subtitle="Roles currently open at VaranasiTrails. Each listing explains the role, what we need and where to apply."
      />

      <Container className="py-6 sm:py-12">
        {isError ? (
          <ErrorState error={error} title="Could not load open positions" onRetry={() => void refetch()} />
        ) : isPending ? (
          <div className="space-y-4" aria-hidden="true">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="h-40 rounded-card" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No open positions right now"
            text="We are not hiring at the moment. New roles are posted here when they open, so check back later."
            action={
              <ButtonLink to="/contact" variant="outline">
                Contact us
              </ButtonLink>
            }
          />
        ) : (
          <>
            {departments.length > 1 && (
              <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by department">
                <button type="button" aria-pressed={department === null} className={chip(department === null)} onClick={() => choose(null)}>
                  All
                </button>
                {departments.map((name) => (
                  <button key={name} type="button" aria-pressed={department === name} className={chip(department === name)} onClick={() => choose(name)}>
                    {name}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-10">
              {groups.map(([name, careers]) => (
                <section key={name} aria-labelledby={`dept-${name}`}>
                  <h2 id={`dept-${name}`} className="mb-4 text-2xl sm:text-3xl">
                    {name}
                  </h2>
                  <ul className="grid gap-4 lg:grid-cols-2">
                    {careers.map((career) => (
                      <li key={career.id}>
                        <CareerCard career={career} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </Container>
    </>
  )
}
