import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Container } from '@/components/layout/Container'
import { aboutContent } from '@/data/home'
import { categoryImageKeys, placeholderImages } from '@/data/placeholderMedia'

// The same plain Booking-style pieces as the home page: bold sans headings, grey bordered
// cards, rounded photo tiles with the title on top, a navy panel for the closing invitation.

const Heading = ({ id, title, subtitle }: { id?: string; title: string; subtitle?: string }) => (
  <div className="mb-5">
    <h2 id={id} className="font-sans text-2xl font-bold tracking-normal text-ink sm:text-[1.75rem]">
      {title}
    </h2>
    {subtitle && <p className="mt-1 text-base text-muted sm:text-lg">{subtitle}</p>}
  </div>
)

/** A photograph under a navy shade with the page title and intro on it. */
export const AboutHero = () => {
  const image = placeholderImages.eveningPrayer

  return (
    <section className="relative isolate flex min-h-[16rem] flex-col justify-end overflow-hidden bg-navy-deep sm:min-h-[26rem]">
      <ImageWithFallback
        src={image.url}
        alt={image.alt}
        priority
        sizes="100vw"
        width={1920}
        height={1080}
        className="absolute inset-0 -z-20 size-full"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep/90 via-navy-deep/50 to-navy-deep/30" />
      <Container className="py-8 sm:py-12">
        <p className="text-sm text-ivory">About us</p>
        <h1 className="mt-2 max-w-3xl text-balance font-sans text-3xl leading-tight font-bold text-ivory sm:text-5xl">
          {aboutContent.title}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-snug text-ivory/90 sm:text-lg">{aboutContent.intro}</p>
      </Container>
      <p className="absolute right-4 bottom-3 hidden text-xs text-ivory/70 sm:block">Photo: {image.credit}</p>
    </section>
  )
}

/** The lead line beside the story, then a wide rounded photograph. */
export const AboutStory = () => {
  const image = placeholderImages.boatsSunset

  return (
    <section className="bg-canvas py-8 sm:py-12" aria-labelledby="story-title">
      <Container>
        <Heading id="story-title" title="Our story" />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <p className="font-sans text-xl leading-snug font-bold text-ink sm:text-2xl">{aboutContent.lead}</p>
          <div className="space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg">
            {aboutContent.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <figure className="mt-8">
          <div className="aspect-[16/9] overflow-hidden rounded-lg bg-canvas-alt sm:aspect-[21/9]">
            <ImageWithFallback src={image.url} alt={image.alt} sizes="100vw" className="size-full" />
          </div>
          <figcaption className="mt-3 flex justify-between gap-4 text-sm text-muted">
            <span>{image.alt}</span>
            <span className="hidden sm:inline">Photo: {image.credit}</span>
          </figcaption>
        </figure>
      </Container>
    </section>
  )
}

/** The four kinds of trip as bordered cards: photo on top, then title and a line of text. */
export const AboutExperiences = () => {
  const { experiences } = aboutContent

  return (
    <section className="bg-canvas py-8 sm:py-12" aria-labelledby="experiences-title">
      <Container>
        <Heading id="experiences-title" title={experiences.title} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.items.map((item) => {
            const image = placeholderImages[categoryImageKeys[item.category] ?? 'riverBoats']
            return (
              <li key={item.category}>
                <Link
                  to={`/destinations?category=${item.category}`}
                  className="group block h-full overflow-hidden rounded-lg border border-line bg-canvas-alt"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-canvas-alt">
                    <ImageWithFallback
                      src={image.url}
                      alt=""
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="size-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-sans text-lg leading-snug font-bold text-ink">{item.title}</h3>
                    <p className="mt-2 text-base leading-snug text-ink-soft">{item.text}</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}

/** Places as photo tiles with the name on top and the note at the bottom; each links to its trips. */
export const AboutPlaces = () => {
  const { places } = aboutContent

  return (
    <section className="bg-canvas py-8 sm:py-12" aria-labelledby="places-title">
      <Container>
        <Heading id="places-title" title={places.title} subtitle={places.text} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.items.map((place) => {
            const image = placeholderImages[place.image]
            return (
              <li key={place.name} className="group relative h-56 overflow-hidden rounded-lg bg-canvas-alt sm:h-64">
                <ImageWithFallback
                  src={image.url}
                  alt=""
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0 size-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/10 to-black/60" aria-hidden="true" />
                <h3 className="absolute inset-x-0 top-0 p-5 font-sans text-xl leading-snug font-bold text-ivory sm:text-2xl">
                  <Link
                    to={`/destinations?q=${encodeURIComponent(place.query)}`}
                    className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                  >
                    {place.name}
                  </Link>
                </h3>
                <p className="absolute inset-x-0 bottom-0 p-5 text-sm text-ivory">{place.note}</p>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}

/** How we work: four small grey cards with a yellow number badge, like the home page. */
export const AboutPrinciples = () => (
  <section className="bg-canvas py-8 sm:py-12" aria-labelledby="principles-title">
    <Container>
      <Heading id="principles-title" title="What you can expect from us" />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {aboutContent.values.map((value, index) => (
          <li key={value.title} className="rounded-lg border border-line bg-canvas-alt p-5">
            <span
              className="flex size-10 items-center justify-center rounded-full bg-gold font-sans text-lg font-bold text-navy-deep"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <h3 className="mt-4 font-sans text-lg leading-snug font-bold text-ink">{value.title}</h3>
            <p className="mt-1 text-base leading-snug text-ink-soft">{value.text}</p>
          </li>
        ))}
      </ol>
    </Container>
  </section>
)

/** A card linking to the founders page, then the closing invitation in a navy panel. */
export const AboutClosing = ({ whatsappUrl }: { whatsappUrl: string }) => {
  const { people, closing } = aboutContent

  return (
    <section className="bg-canvas pt-4 pb-12 sm:pb-16">
      <Container>
        <Link
          to="/founders"
          className="group flex flex-col gap-4 rounded-lg border border-line bg-canvas-alt p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <span>
            <span className="block font-sans text-xl font-bold text-ink sm:text-2xl">{people.title}</span>
            <span className="mt-1 block text-base text-ink-soft">{people.text}</span>
          </span>
          <span className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-lg bg-brand px-4 font-medium text-ivory transition-colors duration-300 group-hover:bg-brand-deep sm:self-auto">
            {people.link}
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </Link>

        <div className="mt-8 rounded-lg bg-navy p-6 text-ivory sm:p-10">
          <h2 className="max-w-2xl text-balance font-sans text-2xl leading-snug font-bold text-ivory sm:text-3xl">{closing.title}</h2>
          <p className="mt-2 max-w-xl text-base leading-snug text-ivory/90 sm:text-lg">{closing.text}</p>
          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
            <Link
              to="/destinations"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-ivory px-6 text-base font-medium text-navy transition-colors duration-300 hover:bg-canvas-alt"
            >
              Explore our trips
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[#25d366] px-6 text-base font-bold text-[#06291a] transition-colors duration-300 hover:bg-[#1ebe5a]"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}
