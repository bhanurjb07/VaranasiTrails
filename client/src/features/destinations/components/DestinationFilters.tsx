import { Search } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useDebounce } from '@/hooks/useDebounce'
import type { Category, DestinationFilters as Filters, Difficulty } from '@/types/api'
import {
  difficultyOptions,
  durationRanges,
  matchRange,
  priceRanges,
  type RangeOption,
} from '../filterOptions'
import type { useDestinationFilters } from '../hooks/useDestinationFilters'

type Update = ReturnType<typeof useDestinationFilters>['update']

interface DestinationFiltersProps {
  filters: Filters
  categories: readonly Category[]
  update: Update
  onReset: () => void
  activeCount: number
}

const Legend = ({ children }: { children: string }) => (
  <legend className="mb-3 font-sans text-sm font-semibold tracking-wide text-indigo uppercase">{children}</legend>
)

const RangeGroup = ({
  name,
  legend,
  options,
  value,
  onSelect,
}: {
  name: string
  legend: string
  options: readonly RangeOption[]
  value: string
  onSelect: (option: RangeOption) => void
}) => (
  <fieldset>
    <Legend>{legend}</Legend>
    <div className="space-y-1.5">
      {options.map((option) => (
        <label
          key={option.id}
          className="flex cursor-pointer items-center gap-3 rounded-control px-2 py-1.5 text-[0.95rem] hover:bg-cream-deep"
        >
          <input
            type="radio"
            name={name}
            checked={value === option.id}
            onChange={() => onSelect(option)}
            className="size-4 accent-saffron"
          />
          {option.label}
        </label>
      ))}
    </div>
  </fieldset>
)

export const DestinationFilters = ({ filters, categories, update, onReset, activeCount }: DestinationFiltersProps) => {
  const searchId = useId()
  const [search, setSearch] = useState(filters.q ?? '')
  const debounced = useDebounce(search, 400)
  // The last search text this component wrote to (or read from) the URL.
  const synced = useRef(filters.q ?? '')

  // Push the typed search into the URL once typing pauses.
  useEffect(() => {
    const text = debounced.trim()
    if (text !== synced.current) {
      synced.current = text
      update({ q: text || undefined })
    }
  }, [debounced, update])

  // Follow URL changes made elsewhere (reset, hero search, back button), but never
  // overwrite text the user is still typing.
  useEffect(() => {
    const fromUrl = filters.q ?? ''
    if (fromUrl !== synced.current) {
      synced.current = fromUrl
      setSearch(fromUrl)
    }
  }, [filters.q])

  return (
    <div className="space-y-8">
      <div>
        <label htmlFor={searchId} className="sr-only">
          Search trips
        </label>
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input
            id={searchId}
            type="search"
            placeholder="Search trips or cities"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <fieldset>
        <Legend>Category</Legend>
        <div className="flex flex-wrap gap-2">
          {[{ id: '', slug: '', name: 'All' }, ...categories].map((category) => {
            const selected = (filters.category ?? '') === category.slug
            return (
              <button
                key={category.id || 'all'}
                type="button"
                aria-pressed={selected}
                onClick={() => update({ category: category.slug || undefined })}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-indigo bg-indigo text-white'
                    : 'border-line bg-white text-indigo hover:border-indigo/50'
                }`}
              >
                {category.name}
              </button>
            )
          })}
        </div>
      </fieldset>

      <RangeGroup
        name="price"
        legend="Price"
        options={priceRanges}
        value={matchRange(priceRanges, filters.minPrice, filters.maxPrice)}
        onSelect={(option) => update({ minPrice: option.min, maxPrice: option.max })}
      />

      <RangeGroup
        name="duration"
        legend="Duration"
        options={durationRanges}
        value={matchRange(durationRanges, filters.minDays, filters.maxDays)}
        onSelect={(option) => update({ minDays: option.min, maxDays: option.max })}
      />

      <div>
        <Legend>Difficulty</Legend>
        <Select
          aria-label="Difficulty"
          value={filters.difficulty ?? ''}
          onChange={(event) => update({ difficulty: (event.target.value as Difficulty) || undefined })}
        >
          {difficultyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <Button variant="ghost" className="w-full" disabled={activeCount === 0} onClick={onReset}>
        Clear all filters
      </Button>
    </div>
  )
}
