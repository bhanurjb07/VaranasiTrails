import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'

/** Phone-only search field under the header, like a store app. Hidden from md up. */
export const MobileSearchBar = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const initial = pathname === '/destinations' ? (params.get('q') ?? '') : ''
  const [query, setQuery] = useState(initial)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const text = query.trim()
    navigate(text ? `/destinations?q=${encodeURIComponent(text)}` : '/destinations')
    ;(document.activeElement as HTMLElement | null)?.blur()
  }

  return (
    <form onSubmit={onSubmit} role="search" className="px-4 pb-2.5 md:hidden">
      <label htmlFor="mobile-search" className="sr-only">
        Search trips
      </label>
      <div className="relative">
        <Search className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id="mobile-search"
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search trips in Varanasi"
          className="h-11 w-full rounded-control border border-line bg-white pr-4 pl-11 text-base text-ink placeholder:text-muted/80 focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20"
        />
      </div>
    </form>
  )
}
