import { useMutation } from '@tanstack/react-query'
import type { RowSelectionState } from '@tanstack/react-table'
import { MapPinned, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { PageHeader } from '@/components/layout/PageHeader'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from '@/components/ui/toast'
import { BulkBar, type BulkAction } from '@/features/destinations/components/BulkBar'
import { DestinationTable } from '@/features/destinations/components/DestinationTable'
import { ListToolbar } from '@/features/destinations/components/ListToolbar'
import { destinationsApi } from '@/features/destinations/api'
import { useDestinationAction, useDestinationList, useRefreshDestinations, type RowAction } from '@/features/destinations/useDestinations'
import { useListParams } from '@/features/destinations/useListParams'
import { errorMessage } from '@/lib/formErrors'
import type { DestinationRow } from '@/types/api'

type Pending = { kind: 'row'; row: DestinationRow; action: RowAction } | { kind: 'bulk'; action: BulkAction }

export const DestinationsPage = () => {
  const navigate = useNavigate()
  const { query, update } = useListParams()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDestinationList(query)
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [pending, setPending] = useState<Pending | null>(null)
  const refresh = useRefreshDestinations()

  const rowAction = useDestinationAction((action, result) => {
    setPending(null)
    if (action === 'duplicate' && result) navigate(`/destinations/${result.id}`)
  })

  const bulk = useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: BulkAction }) => destinationsApi.bulk(ids, action),
    onSuccess: async (result) => {
      await refresh()
      setSelection({})
      setPending(null)
      if (result.failed.length === 0) {
        toast.success(`${result.updated} trip${result.updated === 1 ? '' : 's'} updated`)
      } else {
        toast.warning(`${result.updated} updated, ${result.failed.length} could not change: ${result.failed[0]?.message}`)
      }
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const selectedIds = Object.keys(selection).filter((id) => selection[id])

  // Archive and delete are confirmed; everything else runs straight away.
  const handleRowAction = useCallback(
    (row: DestinationRow, action: RowAction) => {
      if (action === 'archive' || action === 'delete') setPending({ kind: 'row', row, action })
      else rowAction.mutate({ id: row.id, action })
    },
    [rowAction],
  )

  const handleBulk = (action: BulkAction) => {
    if (action === 'archive') setPending({ kind: 'bulk', action })
    else bulk.mutate({ ids: selectedIds, action })
  }

  const confirm = () => {
    if (!pending) return
    if (pending.kind === 'row') rowAction.mutate({ id: pending.row.id, action: pending.action })
    else bulk.mutate({ ids: selectedIds, action: pending.action })
  }

  const filtered = Boolean(query.q || query.category || query.featured || query.status !== 'all')

  return (
    <>
      <PageHeader
        title="Destinations"
        description="Every trip on the site, including drafts."
        actions={
          <Link to="/destinations/new" className={buttonStyles('primary', 'md')}>
            <Plus className="size-4" aria-hidden="true" /> New destination
          </Link>
        }
      />

      <ListToolbar query={query} onChange={(patch) => { setSelection({}); update(patch) }} />
      {selectedIds.length > 0 && (
        <BulkBar count={selectedIds.length} busy={bulk.isPending} onAction={handleBulk} onClear={() => setSelection({})} />
      )}

      {isError ? (
        <ErrorState error={error} title="Could not load destinations" onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((key) => (
            <Skeleton key={key} className="h-16 rounded-card" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState
          icon={MapPinned}
          title={filtered ? 'No destinations match these filters' : 'No destinations yet'}
          text={filtered ? 'Try clearing a filter or searching for something else.' : 'Create your first trip. It starts as a draft, so nothing goes live until you publish it.'}
          action={
            filtered ? undefined : (
              <Link to="/destinations/new" className={buttonStyles('primary', 'md')}>
                <Plus className="size-4" aria-hidden="true" /> New destination
              </Link>
            )
          }
        />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <DestinationTable rows={data.data} selection={selection} onSelectionChange={setSelection} onAction={handleRowAction} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>
              {data.meta.total} trip{data.meta.total === 1 ? '' : 's'}
            </p>
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(page) => { setSelection({}); update({ page: String(page) }) }} />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={confirm}
        loading={rowAction.isPending || bulk.isPending}
        danger
        title={pending?.kind === 'row' && pending.action === 'delete' ? 'Delete permanently?' : 'Archive trips?'}
        confirmLabel={pending?.kind === 'row' && pending.action === 'delete' ? 'Delete permanently' : 'Archive'}
      >
        {pending?.kind === 'row' && pending.action === 'delete' ? (
          <>
            <strong>{pending.row.title}</strong> and its unused photos will be deleted for good. This cannot be undone.
          </>
        ) : pending?.kind === 'row' ? (
          <>
            <strong>{pending.row.title}</strong> will be hidden from the public site. You can restore it later.
          </>
        ) : (
          <>{selectedIds.length} selected trip(s) will be hidden from the public site. You can restore them later.</>
        )}
      </ConfirmDialog>
    </>
  )
}
