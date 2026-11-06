import { Download, Inbox, Search } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import { EnquiryDrawer } from '@/features/enquiries/EnquiryDrawer'
import { EnquiryStatusBadge } from '@/features/enquiries/EnquiryStatusBadge'
import type { EnquiryQuery } from '@/features/enquiries/api'
import { useEnquiryList, useEnquiryMutations } from '@/features/enquiries/useEnquiries'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlParams } from '@/hooks/useUrlParams'
import { timeAgo } from '@/lib/format'
import type { AdminEnquiry, EnquiryStatus } from '@/types/api'

type Tab = 'all' | EnquiryStatus

export const EnquiriesPage = () => {
  const { get, page, update } = useUrlParams()
  const searchId = useId()
  const [selected, setSelected] = useState<AdminEnquiry | null>(null)

  const tab = (get('status') || 'all') as Tab
  const from = get('from')
  const to = get('to')

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

  const query: EnquiryQuery = {
    q: get('q') || undefined,
    status: tab === 'all' ? undefined : tab,
    // The end date is inclusive: run to the end of that day.
    from: from ? `${from}T00:00:00.000Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
    page,
    limit: 20,
  }

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useEnquiryList(query)
  const { exportCsv } = useEnquiryMutations()
  const counts = data?.counts
  const all = counts ? counts.NEW + counts.CONTACTED + counts.CLOSED : undefined

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Messages from the contact form and trip pages."
        actions={
          <Button variant="outline" loading={exportCsv.isPending} onClick={() => exportCsv.mutate({ ...query, page: undefined, limit: undefined })}>
            <Download className="size-4" aria-hidden="true" /> Export CSV
          </Button>
        }
      />

      <div className="mb-4 space-y-3">
        <Tabs
          label="Filter by status"
          value={tab}
          onChange={(value) => update({ status: value === 'all' ? undefined : value })}
          options={[
            { value: 'all', label: 'All', count: all },
            { value: 'NEW', label: 'New', count: counts?.NEW },
            { value: 'CONTACTED', label: 'Contacted', count: counts?.CONTACTED },
            { value: 'CLOSED', label: 'Closed', count: counts?.CLOSED },
          ]}
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-60 flex-1 sm:max-w-sm">
            <label htmlFor={searchId} className="sr-only">
              Search enquiries
            </label>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <Input id={searchId} type="search" placeholder="Search name, email, phone or message" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            From
            <Input type="date" aria-label="From date" value={from} max={to || undefined} onChange={(event) => update({ from: event.target.value || undefined })} className="h-10 w-40" />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            To
            <Input type="date" aria-label="To date" value={to} min={from || undefined} onChange={(event) => update({ to: event.target.value || undefined })} className="h-10 w-40" />
          </label>
        </div>
      </div>

      {isError ? (
        <ErrorState error={error} title="Could not load enquiries" onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-14 rounded-card" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState icon={Inbox} title="No enquiries found" text="Try another status or date range." />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <Table>
            <THead>
              <tr>
                <Th>From</Th>
                <Th>Trip</Th>
                <Th>Message</Th>
                <Th>Status</Th>
                <Th>Received</Th>
              </tr>
            </THead>
            <TBody>
              {data.data.map((enquiry) => (
                <Tr key={enquiry.id} className="cursor-pointer" onClick={() => setSelected(enquiry)}>
                  <Td>
                    <button type="button" onClick={() => setSelected(enquiry)} className="text-left">
                      <span className="block font-semibold text-indigo hover:underline">{enquiry.name}</span>
                      <span className="block text-xs text-muted">{enquiry.phone}</span>
                    </button>
                  </Td>
                  <Td className="max-w-48 truncate text-muted">{enquiry.destination?.title ?? 'General'}</Td>
                  <Td className="max-w-72 truncate text-muted">{enquiry.message}</Td>
                  <Td>
                    <EnquiryStatusBadge status={enquiry.status} />
                  </Td>
                  <Td className="whitespace-nowrap text-muted">{timeAgo(enquiry.createdAt)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>{data.meta.total} enquir{data.meta.total === 1 ? 'y' : 'ies'}</p>
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(next) => update({ page: String(next) })} />
          </div>
        </div>
      )}

      <EnquiryDrawer
        enquiry={selected ? (data?.data.find((row) => row.id === selected.id) ?? selected) : null}
        onClose={() => setSelected(null)}
      />
    </>
  )
}
