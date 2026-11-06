import { Link, useParams } from 'react-router'

import { buttonStyles } from '@/components/ui/buttonStyles'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { DestinationEditor } from '@/features/destinations/editor/DestinationEditor'
import { useDestinationDetail } from '@/features/destinations/useDestinations'
import { isApiError } from '@/lib/apiClient'

/** /destinations/new creates; /destinations/:id edits. */
export const DestinationEditorPage = () => {
  const { id } = useParams()
  const { data, isPending, isError, error, refetch } = useDestinationDetail(id)

  if (!id) return <DestinationEditor />

  if (isPending) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <Skeleton className="h-14 rounded-card" />
        <Skeleton className="h-72 rounded-card" />
        <Skeleton className="h-72 rounded-card" />
      </div>
    )
  }

  if (isError) {
    if (isApiError(error) && error.status === 404) {
      return (
        <div className="flex flex-col items-center py-20 text-center">
          <h1 className="text-3xl">Destination not found</h1>
          <p className="mt-2 text-muted">It may have been deleted.</p>
          <Link to="/destinations" className={`${buttonStyles('primary', 'lg')} mt-6`}>
            Back to destinations
          </Link>
        </div>
      )
    }
    return <ErrorState error={error} title="Could not load this destination" onRetry={() => void refetch()} />
  }

  return <DestinationEditor key={data.id} destination={data} />
}
