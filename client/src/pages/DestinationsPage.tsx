import { Compass, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PageHeader } from '@/components/common/PageHeader'
import { SeoHead } from '@/components/common/SeoHead'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { DestinationFilters } from '@/features/destinations/components/DestinationFilters'
import { DestinationGrid } from '@/features/destinations/components/DestinationGrid'
import { sortOptions } from '@/features/destinations/filterOptions'
import { useDestinationFilters } from '@/features/destinations/hooks/useDestinationFilters'
import { useCategories, useDestinations } from '@/features/destinations/hooks/useDestinations'
import type { DestinationSort } from '@/types/api'

export const DestinationsPage = () => {
  const { filters, update, reset, activeCount } = useDestinationFilters()
  const [drawer, setDrawer] = useState(false)
  const categories = useCategories()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDestinations(filters)

  const panel = (
    <DestinationFilters
      filters={filters}
      categories={categories.data ?? []}
      update={update}
      onReset={reset}
      activeCount={activeCount}
    />
  )

  return (
    <>
      <SeoHead
        title="Trips in Varanasi and Uttar Pradesh"
        description="Browse guided boat rides, heritage walks, food trails and pilgrimages in Varanasi, Sarnath and beyond. Filter by price, duration and difficulty."
        path="/destinations"
      />
      <PageHeader
        eyebrow="All trips"
        title="Find your Varanasi trip"
        subtitle="Boat rides, heritage walks, food trails and pilgrimages, all led by local guides."
      />

      <Container className="grid gap-10 py-10 lg:grid-cols-[18rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-card border border-line/70 bg-surface p-6 shadow-card">
            {panel}
          </div>
        </aside>

        <section aria-label="Results" aria-busy={isPlaceholderData} className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted" aria-live="polite">
              {data ? (
                <>
                  <strong className="text-indigo">{data.meta.total}</strong> trip{data.meta.total === 1 ? '' : 's'} found
                </>
              ) : (
                'Loading trips...'
              )}
            </p>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}>
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters{activeCount > 0 ? ` (${activeCount})` : ''}
              </Button>
              <div className="w-48">
                <Select
                  aria-label="Sort trips"
                  value={filters.sort}
                  onChange={(event) => update({ sort: event.target.value as DestinationSort })}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {isError ? (
            <ErrorState error={error} title="Could not load trips" onRetry={() => void refetch()} />
          ) : data && data.data.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No trips match those filters"
              text="Try widening your price range or clearing a filter."
              action={<Button onClick={reset}>Clear filters</Button>}
            />
          ) : (
            <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              <DestinationGrid destinations={data?.data} loading={isPending} columns={3} />
            </div>
          )}

          {data && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onChange={(page) => {
                update({ page })
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="mt-10"
            />
          )}
        </section>
      </Container>

      <Modal open={drawer} onClose={() => setDrawer(false)} title="Filters" className="max-w-md">
        {panel}
        <Button className="mt-6 w-full" size="lg" onClick={() => setDrawer(false)}>
          Show {data?.meta.total ?? ''} trips
        </Button>
      </Modal>
    </>
  )
}
