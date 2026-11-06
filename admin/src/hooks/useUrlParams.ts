import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Filters kept in the URL query string, so a filtered list can be bookmarked and the
 * back button works. Any change except `page` itself returns to page 1.
 */
export const useUrlParams = () => {
  const [params, setParams] = useSearchParams()

  const get = useCallback((key: string) => params.get(key) ?? '', [params])

  const page = Math.max(Number(params.get('page')) || 1, 1)

  const update = useCallback(
    (patch: Record<string, string | undefined>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(patch)) {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          if (!('page' in patch)) next.delete('page')
          return next
        },
        { preventScrollReset: true },
      )
    },
    [setParams],
  )

  return { get, page, update }
}
