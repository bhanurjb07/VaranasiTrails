import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

import type { Difficulty, DestinationFilters, DestinationSort } from '@/types/api'

const SORTS: DestinationSort[] = ['popular', 'rating', 'price_asc', 'price_desc', 'newest']
const DIFFICULTIES: Difficulty[] = ['EASY', 'MODERATE', 'HARD']

const toInt = (value: string | null) => {
  if (value === null || value === '') return undefined
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 ? number : undefined
}

export const parseFilters = (params: URLSearchParams): DestinationFilters => {
  const sort = params.get('sort') as DestinationSort | null
  const difficulty = params.get('difficulty') as Difficulty | null

  return {
    q: params.get('q')?.trim() || undefined,
    category: params.get('category') || undefined,
    minPrice: toInt(params.get('minPrice')),
    maxPrice: toInt(params.get('maxPrice')),
    minDays: toInt(params.get('minDays')),
    maxDays: toInt(params.get('maxDays')),
    difficulty: difficulty && DIFFICULTIES.includes(difficulty) ? difficulty : undefined,
    sort: sort && SORTS.includes(sort) ? sort : 'popular',
    page: Math.max(toInt(params.get('page')) ?? 1, 1),
    limit: 12,
  }
}

const KEYS = ['q', 'category', 'minPrice', 'maxPrice', 'minDays', 'maxDays', 'difficulty', 'sort', 'page'] as const

/** Filters live in the URL query string, so listings are shareable and back-button friendly. */
export const useDestinationFilters = () => {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(params), [params])

  const update = useCallback(
    (patch: Partial<Record<(typeof KEYS)[number], string | number | undefined>>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === '' || (key === 'sort' && value === 'popular')) next.delete(key)
            else next.set(key, String(value))
          }
          // Any filter change starts again from page 1; changing the page itself keeps it.
          if (!('page' in patch)) next.delete('page')
          return next
        },
        { preventScrollReset: true },
      )
    },
    [setParams],
  )

  const reset = useCallback(() => {
    setParams((current) => {
      const next = new URLSearchParams()
      const sort = current.get('sort')
      if (sort) next.set('sort', sort)
      return next
    })
  }, [setParams])

  const activeCount = [
    filters.q,
    filters.category,
    filters.minPrice ?? filters.maxPrice,
    filters.minDays ?? filters.maxDays,
    filters.difficulty,
  ].filter((value) => value !== undefined).length

  return { filters, update, reset, activeCount }
}
