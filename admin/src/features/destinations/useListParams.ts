import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

import type { DestinationListQuery, DestinationStatus } from '@/types/api'

const STATUSES: ('all' | DestinationStatus)[] = ['all', 'published', 'draft', 'archived']
const SORTS: NonNullable<DestinationListQuery['sort']>[] = ['updated', 'newest', 'title', 'price_asc', 'price_desc']

export const parseListParams = (params: URLSearchParams): DestinationListQuery => {
  const status = params.get('status') as 'all' | DestinationStatus | null
  const sort = params.get('sort') as NonNullable<DestinationListQuery['sort']> | null
  const page = Number(params.get('page'))

  return {
    q: params.get('q')?.trim() || undefined,
    status: status && STATUSES.includes(status) ? status : 'all',
    category: params.get('category') || undefined,
    featured: params.get('featured') === 'true' ? true : undefined,
    sort: sort && SORTS.includes(sort) ? sort : 'updated',
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: 20,
  }
}

/** List filters live in the URL, so a filtered list can be bookmarked or shared. */
export const useListParams = () => {
  const [params, setParams] = useSearchParams()
  const query = useMemo(() => parseListParams(params), [params])

  const update = useCallback(
    (patch: Record<string, string | undefined>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(patch)) {
            const isDefault = (key === 'status' && value === 'all') || (key === 'sort' && value === 'updated')
            if (!value || isDefault) next.delete(key)
            else next.set(key, value)
          }
          if (!('page' in patch)) next.delete('page')
          return next
        },
        { preventScrollReset: true },
      )
    },
    [setParams],
  )

  return { query, update }
}
