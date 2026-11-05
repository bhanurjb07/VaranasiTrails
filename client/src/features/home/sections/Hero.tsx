import { motion, useReducedMotion } from 'framer-motion'
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
  const reduce = useReducedMotion()
  const [query, setQuery] = useState('')
  const image = placeholderImages.ghatSunrise

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const text = query.trim()
    navigate(text ? `/destinations?q=${encodeURIComponent(text)}` : '/destinations')
  }

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-indigo pb-16 sm:items-center sm:pb-0">
      <ImageWithFallback
        src={image.url}
        alt={image.alt}
        priority
        sizes="100vw"
        width={1920}
        height={1080}
        className="absolute inset-0 -z-20 size-full"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo via-indigo/55 to-indigo/30 sm:bg-gradient-to-r sm:from-indigo/90 sm:via-indigo/55 sm:to-indigo/10" />

      <Container className="pt-32 sm:pt-24">
        <div className="max-w-2xl">
          <motion.p
            {...rise(0.05)}
            className="mb-4 text-xs font-semibold tracking-[0.22em] text-gold uppercase sm:text-sm"
          >
            {hero.eyebrow}
          </motion.p>
          <motion.h1 {...rise(0.15)} className="text-balance text-5xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            {hero.title}
          </motion.h1>
          <motion.p {...rise(0.25)} className="mt-6 max-w-xl text-lg text-white/85 sm:text-xl">
            {hero.subtitle}
          </motion.p>

          <motion.form
            {...rise(0.35)}
            onSubmit={onSubmit}
            role="search"
            className="mt-9 flex w-full max-w-xl flex-col gap-3 rounded-[1.75rem] bg-white p-2 shadow-lift sm:flex-row sm:items-center sm:rounded-full"
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
                className="h-12 w-full rounded-full bg-transparent pr-4 pl-12 text-ink placeholder:text-muted/80 focus:outline-none"
              />
            </div>
            <Button type="submit" size="md" className="sm:px-8">
              {hero.primaryCta}
            </Button>
          </motion.form>

          <motion.ul {...rise(0.45)} className="mt-6 flex flex-wrap gap-2" aria-label="Popular searches">
            {hero.quickLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-block rounded-full border border-white/35 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/25"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        </div>
      </Container>

      <p className="absolute right-4 bottom-3 hidden text-[0.7rem] text-white/50 sm:block">Photo: {image.credit}</p>
    </section>
  )
}
