import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { hero } from '@/data/home'
import { placeholderImages } from '@/data/placeholderMedia'

export const Hero = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const image = placeholderImages.ghatSunrise

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const text = query.trim()
    navigate(text ? `/destinations?q=${encodeURIComponent(text)}` : '/destinations')
  }

  return (
    <section className="relative isolate flex min-h-[17rem] items-end overflow-hidden bg-indigo pb-6 md:min-h-[100svh] md:items-center md:pb-0">
      <ImageWithFallback
        src={image.url}
        alt={image.alt}
        priority
        sizes="100vw"
        width={1920}
        height={1080}
        className="absolute inset-0 -z-20 size-full"
      />
      {/* Plain dark overlay so the headline stays readable on the photo. */}
      <div className="absolute inset-0 -z-10 bg-indigo/60" />

      <Container className="pt-10 md:pt-24">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold tracking-[0.22em] text-gold uppercase sm:mb-4 sm:text-sm">{hero.eyebrow}</p>
          <h1 className="text-balance text-3xl leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-7xl">{hero.title}</h1>
          <p className="mt-3 max-w-xl text-base text-white/90 sm:mt-6 sm:text-lg md:text-xl">{hero.subtitle}</p>

          <form
            onSubmit={onSubmit}
            role="search"
            className="mt-9 hidden w-full max-w-xl flex-col gap-3 rounded-control bg-white p-2 shadow-lift md:flex md:flex-row md:items-center"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search trips
            </label>
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={hero.searchPlaceholder}
                className="h-12 w-full rounded-control bg-transparent pr-4 pl-12 text-ink placeholder:text-muted/80 focus:outline-none"
              />
            </div>
            <Button type="submit" size="md" className="sm:px-8">
              {hero.primaryCta}
            </Button>
          </form>

          <ul className="mt-4 flex flex-wrap gap-2 md:mt-6" aria-label="Popular searches">
            {hero.quickLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-block rounded-md border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/25"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <p className="absolute right-4 bottom-3 hidden text-[0.7rem] text-white/70 sm:block">Photo: {image.credit}</p>
    </section>
  )
}
