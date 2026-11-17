import { ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Container } from '@/components/layout/Container'
import { hero } from '@/data/home'
import { placeholderImages } from '@/data/placeholderMedia'
import { durationRanges } from '@/features/destinations/filterOptions'
import { useCategories } from '@/features/destinations/hooks/useDestinations'

const fieldLabel = 'block text-sm text-ink'
const fieldControl =
  'mt-1.5 h-14 w-full appearance-none rounded-lg bg-white px-4 text-base font-medium text-ink placeholder:font-normal placeholder:text-muted focus:outline-2 focus:outline-offset-0 focus:outline-brand'

/**
 * Full-bleed photograph with the copy set low and to the left, and a quiet booking bar:
 * hairline-separated fields that open the trips list with those filters applied.
 */
export const Hero = () => {
  const navigate = useNavigate()
  const categories = useCategories()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [duration, setDuration] = useState('any')
  const image = placeholderImages.riverBoats

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (category) params.set('category', category)
    const range = durationRanges.find((option) => option.id === duration)
    if (range?.min !== undefined) params.set('minDays', String(range.min))
    if (range?.max !== undefined) params.set('maxDays', String(range.max))
    const search = params.toString()
    navigate(search ? `/destinations?${search}` : '/destinations')
  }

  return (
    <section className="relative isolate flex min-h-[19rem] flex-col justify-end overflow-hidden bg-navy-deep sm:min-h-[34rem] md:min-h-[100svh]">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <ImageWithFallback
          src={image.url}
          alt={image.alt}
          priority
          sizes="100vw"
          width={1920}
          height={1080}
          className="animate-drift size-full"
        />
      </div>
      {/* A plain dark scrim, heavier at the bottom where the text sits. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep/90 via-navy-deep/35 to-navy-deep/20" />

      <Container className="pt-10 pb-5 sm:pt-16 sm:pb-10 md:pt-40 md:pb-16">
        <div className="animate-enter max-w-3xl">
          <p className="flex items-center gap-3 text-sm font-medium text-ivory/85 sm:gap-4 sm:text-sm">
            <span className="h-px w-6 bg-brand sm:w-10" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1 className="mt-3 text-balance font-sans text-[2rem] leading-tight font-bold text-ivory sm:mt-5 sm:text-5xl md:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ivory/80 sm:mt-6 sm:text-lg">{hero.subtitle}</p>
        </div>

        <form
          onSubmit={onSubmit}
          role="search"
          aria-label="Find a trip"
          className="animate-enter mt-10 hidden gap-2 rounded-lg bg-gold p-3 sm:grid sm:grid-cols-2 md:mt-14 lg:grid-cols-[1.4fr_1fr_1fr_auto]"
        >
          <label className="block">
            <span className={fieldLabel}>Where</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={hero.searchPlaceholder}
              className={fieldControl}
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>Experience</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className={fieldControl}>
              <option value="">All experiences</option>
              {categories.data?.map((option) => (
                <option key={option.id} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={fieldLabel}>Duration</span>
            <select value={duration} onChange={(event) => setDuration(event.target.value)} className={fieldControl}>
              {durationRanges.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="flex h-14 items-center justify-center gap-3 self-end rounded-lg bg-brand px-10 text-lg font-medium text-ivory transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-deep hover:shadow-lg active:translate-y-0 active:scale-[0.98] sm:col-span-2 lg:col-span-1"
          >
            {hero.primaryCta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>

        <p className="scrollbar-none -mx-5 mt-4 flex items-center gap-x-5 overflow-x-auto px-5 text-sm whitespace-nowrap text-ivory/75 sm:mx-0 sm:mt-6 sm:flex-wrap sm:gap-x-6 sm:gap-y-2 sm:px-0">
          <span className="text-sm sm:text-sm">Popular</span>
          {hero.quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="border-b border-ivory/25 pb-0.5 transition-colors duration-500 hover:border-brand hover:text-ivory"
            >
              {link.label}
            </Link>
          ))}
        </p>
      </Container>
    </section>
  )
}
