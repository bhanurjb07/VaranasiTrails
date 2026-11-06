import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Download, ScrollText } from 'lucide-react'
import { useMemo } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useUrlParams } from '@/hooks/useUrlParams'
import { api, type Query } from '@/lib/apiClient'
import { downloadFile, toCsv } from '@/lib/csv'
import { formatDate } from '@/lib/format'
import type { AuditEntry, Paginated } from '@/types/api'

const entityTypes = ['destination', 'category', 'enquiry', 'user', 'review']

const tone = (action: string) =>
  action.endsWith('delete') ? 'danger' : action.endsWith('block') || action.endsWith('archive') || action.endsWith('hide') ? 'warning' : action.endsWith('publish') ? 'success' : 'info'

const time = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })

export const AuditLogPage = () => {
  const { get, page, update } = useUrlParams()
  const query: Query = {
    entityType: get('entityType') || undefined,
    action: get('action') || undefined,
    from: get('from') ? `${get('from')}T00:00:00.000Z` : undefined,
    to: get('to') ? `${get('to')}T23:59:59.999Z` : undefined,
    page,
    limit: 30,
  }

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useQuery({
    queryKey: ['admin', 'audit', query],
    queryFn: ({ signal }) => api.get<Paginated<AuditEntry>>('/admin/audit-log', query, signal),
    placeholderData: keepPreviousData,
  })

  // Group by day for the timeline.
  const days = useMemo(() => {
    const groups = new Map<string, AuditEntry[]>()
    for (const entry of data?.data ?? []) {
      const day = formatDate(entry.createdAt)
      groups.set(day, [...(groups.get(day) ?? []), entry])
    }
    return [...groups.entries()]
  }, [data])

  const exportPage = () => {
    if (!data) return
    downloadFile(
      toCsv(['When', 'Admin', 'Action', 'Entity', 'Summary'], data.data.map((e) => [e.createdAt, e.admin.email, e.action, e.entityType, e.summary])),
      `audit-log-page-${data.meta.page}.csv`,
    )
  }

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every change an administrator makes, newest first."
        actions={
          <Button variant="outline" onClick={exportPage} disabled={!data || data.data.length === 0}>
            <Download className="size-4" aria-hidden="true" /> Export this page
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="w-44">
          <Select aria-label="Entity type" value={get('entityType')} onChange={(event) => update({ entityType: event.target.value || undefined })}>
            <option value="">All areas</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {type[0]?.toUpperCase()}{type.slice(1)}
              </option>
            ))}
          </Select>
        </div>
        <Input
          aria-label="Action prefix, for example destination.publish"
          placeholder="Action, e.g. destination.publish"
          defaultValue={get('action')}
          onBlur={(event) => update({ action: event.target.value.trim() || undefined })}
          onKeyDown={(event) => event.key === 'Enter' && update({ action: event.currentTarget.value.trim() || undefined })}
          className="w-64"
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          From
          <Input type="date" aria-label="From date" value={get('from')} onChange={(event) => update({ from: event.target.value || undefined })} className="h-10 w-40" />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          To
          <Input type="date" aria-label="To date" value={get('to')} onChange={(event) => update({ to: event.target.value || undefined })} className="h-10 w-40" />
        </label>
      </div>

      {isError ? (
        <ErrorState error={error} title="Could not load the audit log" onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((key) => (
            <Skeleton key={key} className="h-14 rounded-card" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState icon={ScrollText} title="Nothing recorded yet" text="Admin actions will appear here as they happen." />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <div className="space-y-8">
            {days.map(([day, entries]) => (
              <section key={day} aria-label={day}>
                <h2 className="mb-3 font-sans text-sm font-semibold tracking-wide text-muted uppercase">{day}</h2>
                <ol className="relative space-y-3 border-l-2 border-line pl-6">
                  {entries.map((entry) => (
                    <li key={entry.id} className="relative rounded-card border border-line/70 bg-surface p-4 shadow-card">
                      <span className="absolute top-5 -left-[1.9rem] size-3 rounded-full border-2 border-cream bg-saffron" aria-hidden="true" />
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={tone(entry.action)}>{entry.action}</Badge>
                        <span className="text-xs text-muted">
                          {time(entry.createdAt)} &middot; {entry.admin.name}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-ink">{entry.summary}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>{data.meta.total} entr{data.meta.total === 1 ? 'y' : 'ies'}</p>
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(next) => update({ page: String(next) })} />
          </div>
        </div>
      )}
    </>
  )
}
