import { CalendarDays, IndianRupee, MessageCircle, Search } from 'lucide-react'
import { useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'

import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { hero } from '@/data/home'
import { HeroBackground } from '../scene/HeroBackground'

const HIGHLIGHT = 'Varanasi'

const promises = [
  { icon: IndianRupee, label: 'Clear prices' },
  { icon: CalendarDays, label: 'Day-by-day plans' },
  { icon: MessageCircle, label: 'Book on WhatsApp' },
] as const

/** Staggered entrance: each block rises in a little after the one before. */
const step = (index: number): CSSProperties => ({ animationDelay: `${120 + index * 90}ms` })

/** The title with the first "Varanasi" picked out in the warm gradient. */
const Title = () => {
  const at = hero.title.indexOf(HIGHLIGHT)
  if (at === -1) return <>{hero.title}</>
  return (
    <>
      {hero.title.slice(0, at)}
      <span className="text-glow">{HIGHLIGHT}</span>
      {hero.title.slice(at + HIGHLIGHT.length)}
    </>
  )
}

export const Hero = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const text = query.trim()
    navigate(text ? `/destinations?q=${encodeURIComponent(text)}` : '/destinations')
  }

  return (
    <section className="relative isolate flex min-h-[calc(100svh-7.25rem)] items-end overflow-hidden bg-night pb-10 md:min-h-[100svh] md:items-center md:pb-0">
      <HeroBackground />
      {/* Keeps the copy readable over the scene: darker towards the text, clear towards the glow. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night/90 via-night/35 to-transparent md:bg-gradient-to-r md:from-night/75 md:via-night/25" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-b from-transparent to-cream" />

      <Container className="pt-10 md:pt-24">
        <div className="max-w-2xl">
          <p
            className="animate-enter mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-semibold tracking-[0.18em] text-white/85 uppercase backdrop-blur-md sm:mb-6"
            style={step(0)}
          >
            <span className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_var(--color-gold)]" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1
            className="animate-enter text-balance text-[2.35rem] leading-[1.05] text-white sm:text-6xl lg:text-7xl"
            style={step(1)}
          >
            <Title />
          </h1>
          <p className="animate-enter mt-4 max-w-xl text-base text-white/80 sm:mt-6 sm:text-lg md:text-xl" style={step(2)}>
            {hero.subtitle}
          </p>

          <form
            onSubmit={onSubmit}
            role="search"
            className="animate-enter mt-9 hidden w-full max-w-xl items-center gap-2 rounded-full border border-white/15 bg-white/10 p-1.5 shadow-lift backdrop-blur-xl md:flex"
            style={step(3)}
          >
            <label htmlFor="hero-search" className="sr-only">
              Search trips
            </label>
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/60" aria-hidden="true" />
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={hero.searchPlaceholder}
                className="h-12 w-full rounded-full bg-transparent pr-4 pl-12 text-white placeholder:text-white/55 focus:outline-none"
              />
            </div>
            <Button type="submit" size="lg">
              {hero.primaryCta}
            </Button>
          </form>

          <ul className="animate-enter mt-5 flex flex-wrap gap-2 md:mt-6" aria-label="Popular searches" style={step(4)}>
            {hero.quickLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-block rounded-full border border-white/20 bg-white/8 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md transition-colors duration-300 hover:border-white/40 hover:bg-white/18 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <ul
            className="animate-enter mt-8 hidden flex-wrap gap-x-6 gap-y-2 text-sm text-white/70 sm:flex md:mt-12"
            style={step(5)}
          >
            {promises.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4 text-gold" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
