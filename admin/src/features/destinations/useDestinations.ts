import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/components/ui/toast'
import { dashboardKey } from '@/features/dashboard/useDashboard'
import { isApiError } from '@/lib/apiClient'
import { errorMessage } from '@/lib/formErrors'
import type { AdminDestination, DestinationListQuery } from '@/types/api'
import { destinationsApi } from './api'

export const destinationKeys = {
  all: ['admin', 'destinations'] as const,
  list: (query: DestinationListQuery) => ['admin', 'destinations', 'list', query] as const,
  detail: (id: string) => ['admin', 'destinations', 'detail', id] as const,
}

export const useDestinationList = (query: DestinationListQuery) =>
  useQuery({
    queryKey: destinationKeys.list(query),
    queryFn: ({ signal }) => destinationsApi.list(query, signal),
    placeholderData: keepPreviousData,
  })

export const useDestinationDetail = (id: string | undefined) =>
  useQuery({
    queryKey: destinationKeys.detail(id ?? ''),
    queryFn: ({ signal }) => destinationsApi.get(id!, signal).then((response) => response.destination),
    enabled: Boolean(id),
    staleTime: 0,
    retry: (count, error) => !(isApiError(error) && error.status === 404) && count < 2,
  })

/** Lists, the dashboard and the open editor all depend on destination data. */
export const useRefreshDestinations = () => {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: destinationKeys.all }),
      queryClient.invalidateQueries({ queryKey: dashboardKey }),
    ])
  }
}

export type RowAction = 'publish' | 'unpublish' | 'archive' | 'restore' | 'duplicate' | 'feature' | 'unfeature' | 'delete'

const messages: Record<RowAction, string> = {
  publish: 'Trip published',
  unpublish: 'Trip moved back to drafts',
  archive: 'Trip archived',
  restore: 'Trip restored as a draft',
  duplicate: 'Trip duplicated as a draft',
  feature: 'Trip featured',
  unfeature: 'Trip no longer featured',
  delete: 'Trip deleted permanently',
}

/** One mutation for every row action in the list and the editor header. */
export const useDestinationAction = (onDone?: (action: RowAction, result?: AdminDestination) => void) => {
  const refresh = useRefreshDestinations()

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: RowAction }) => {
      switch (action) {
        case 'publish':
          return (await destinationsApi.publish(id)).destination
        case 'unpublish':
          return (await destinationsApi.unpublish(id)).destination
        case 'archive':
          return (await destinationsApi.archive(id)).destination
        case 'restore':
          return (await destinationsApi.restore(id)).destination
        case 'duplicate':
          return (await destinationsApi.duplicate(id)).destination
        case 'feature':
          return (await destinationsApi.setFeatured(id, true)).destination
        case 'unfeature':
          return (await destinationsApi.setFeatured(id, false)).destination
        case 'delete':
          await destinationsApi.remove(id)
          return undefined
      }
    },
    onSuccess: async (result, { action }) => {
      await refresh()
      toast.success(messages[action])
      onDone?.(action, result)
    },
    onError: (error) => {
      // NOT_READY carries a field list: show the first few reasons in the toast.
      if (isApiError(error) && error.code === 'NOT_READY' && error.errors?.length) {
        toast.error(`Not ready to publish: ${error.errors.map((issue) => issue.message).slice(0, 3).join('; ')}`)
        return
      }
      toast.error(errorMessage(error))
    },
  })
}
