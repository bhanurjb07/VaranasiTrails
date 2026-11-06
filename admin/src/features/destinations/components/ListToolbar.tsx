import { Search } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Tabs, type TabOption } from '@/components/ui/Tabs'
import { useCategories } from '@/features/categories/useCategories'
import { useDebounce } from '@/hooks/useDebounce'
import type { DestinationListQuery, DestinationStatus } from '@/types/api'

type StatusTab = 'all' | DestinationStatus

const statusTabs: readonly TabOption<StatusTab>[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

const sorts: { value: NonNullable<DestinationListQuery['sort']>; label: string }[] = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'newest', label: 'Newest first' },
  { value: 'title', label: 'Title A to Z' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
]

interface ListToolbarProps {
  query: DestinationListQuery
  onChange: (patch: Record<string, string | undefined>) => void
}

export const ListToolbar = ({ query, onChange }: ListToolbarProps) => {
  const searchId = useId()
  const categories = useCategories()
  const [search, setSearch] = useState(query.q ?? '')
  const debounced = useDebounce(search, 350)
  // The last search text this component wrote to (or read from) the URL.
  const synced = useRef(query.q ?? '')

  useEffect(() => {
    const text = debounced.trim()
    if (text !== synced.current) {
      synced.current = text
      onChange({ q: text || undefined })
    }
  }, [debounced, onChange])

  // Follow URL changes made elsewhere without overwriting text still being typed.
  useEffect(() => {
    const fromUrl = query.q ?? ''
    if (fromUrl !== synced.current) {
      synced.current = fromUrl
      setSearch(fromUrl)
    }
  }, [query.q])

  return (
    <div className="mb-4 space-y-3">
      <Tabs label="Filter by status" options={statusTabs} value={query.status ?? 'all'} onChange={(status) => onChange({ status })} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <label htmlFor={searchId} className="sr-only">
            Search trips
          </label>
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input id={searchId} type="search" placeholder="Search title, city or slug" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
        </div>

        <div className="w-48">
          <Select aria-label="Category" value={query.category ?? ''} onChange={(event) => onChange({ category: event.target.value || undefined })}>
            <option value="">All categories</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-48">
          <Select aria-label="Sort" value={query.sort ?? 'updated'} onChange={(event) => onChange({ sort: event.target.value })}>
            {sorts.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </Select>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-indigo">
          <Checkbox label="Featured only" checked={query.featured === true} onChange={(event) => onChange({ featured: event.target.checked ? 'true' : undefined })} />
          Featured only
        </label>
      </div>
    </div>
  )
}
