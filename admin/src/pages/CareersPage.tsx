import { Briefcase, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { Switch } from '@/components/ui/Switch'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import { CareerModal } from '@/features/careers/CareerModal'
import { employmentLabels, formatClosingDate, workModeLabels } from '@/features/careers/labels'
import { useCareerList, useCareerMutations } from '@/features/careers/useCareers'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlParams } from '@/hooks/useUrlParams'
import type { AdminCareer } from '@/types/api'

type Tab = 'all' | 'live' | 'draft'

const statusBadge = (career: AdminCareer) =>
  career.status === 'live' ? (
    <Badge variant="published">Live</Badge>
  ) : career.status === 'closed' ? (
    <Badge variant="archived">Closed</Badge>
  ) : (
    <Badge variant="draft">Draft</Badge>
  )

export const CareersPage = () => {
  const { get, page, update } = useUrlParams()
  const searchId = useId()
  const [editing, setEditing] = useState<AdminCareer | 'new' | null>(null)
  const [deleting, setDeleting] = useState<AdminCareer | null>(null)
  const { setPublished, remove } = useCareerMutations()

  const tab = (get('show') || 'all') as Tab

  const [search, setSearch] = useState(get('q'))
  const debounced = useDebounce(search, 350)
  const synced = useRef(get('q'))
  useEffect(() => {
    const text = debounced.trim()
    if (text !== synced.current) {
      synced.current = text
      update({ q: text || undefined })
    }
  }, [debounced, update])

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useCareerList({
    q: get('q') || undefined,
    published: tab === 'all' ? undefined : tab === 'live',
    page,
    limit: 20,
  })

  return (
    <>
      <PageHeader
        title="Careers"
        description="Open positions shown on the Careers page of the website. With no live listings, the page tells visitors there are none."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden="true" /> New listing
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs
          label="Filter by visibility"
          value={tab}
          onChange={(value) => update({ show: value === 'all' ? undefined : value })}
          options={[
            { value: 'all', label: 'All' },
            { value: 'live', label: 'Published' },
            { value: 'draft', label: 'Drafts' },
          ]}
        />
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <label htmlFor={searchId} className="sr-only">
            Search listings
          </label>
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input id={searchId} type="search" placeholder="Search role, department or location" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
        </div>
      </div>

      {isError ? (
        <ErrorState error={error} title="Could not load job listings" onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-16 rounded-card" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job listings"
          text="Add a role such as Backend Developer or AI / ML Engineer, with what it involves and a link to apply."
          action={<Button onClick={() => setEditing('new')}>New listing</Button>}
        />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <Table>
            <THead>
              <tr>
                <Th>Role</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Closes</Th>
                <Th>On the site</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {data.data.map((career) => (
                <Tr key={career.id}>
                  <Td>
                    <button type="button" onClick={() => setEditing(career)} className="text-left">
                      <span className="block font-semibold text-indigo hover:underline">{career.title}</span>
                      <span className="block text-xs text-muted">
                        {career.department} &middot; {career.location}
                      </span>
                    </button>
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {employmentLabels[career.employmentType]}, {workModeLabels[career.workMode].toLowerCase()}
                  </Td>
                  <Td>{statusBadge(career)}</Td>
                  <Td className="whitespace-nowrap text-muted">{career.closesAt ? formatClosingDate(career.closesAt) : 'No end date'}</Td>
                  <Td>
                    <Switch
                      label={`${career.isPublished ? 'Hide' : 'Show'} ${career.title} on the Careers page`}
                      checked={career.isPublished}
                      disabled={setPublished.isPending && setPublished.variables?.id === career.id}
                      onChange={(isPublished) => setPublished.mutate({ id: career.id, isPublished })}
                    />
                    {career.status === 'closed' && (
                      <button type="button" onClick={() => setEditing(career)} className="mt-1 block text-left text-xs font-medium text-danger hover:underline">
                        Hidden: closing date passed. Change the date to reopen.
                      </button>
                    )}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" aria-label={`Edit ${career.title}`} onClick={() => setEditing(career)}>
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="sm" aria-label={`Delete ${career.title}`} onClick={() => setDeleting(career)}>
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>{data.meta.total} listing{data.meta.total === 1 ? '' : 's'}</p>
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(next) => update({ page: String(next) })} />
          </div>
        </div>
      )}

      {editing !== null && <CareerModal open onClose={() => setEditing(null)} career={editing === 'new' ? undefined : editing} />}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
        loading={remove.isPending}
        danger
        title="Delete this listing?"
        confirmLabel="Delete listing"
      >
        <strong>{deleting?.title}</strong> will be removed from the Careers page and cannot be recovered. To hide it for now, switch it off instead.
      </ConfirmDialog>
    </>
  )
}
