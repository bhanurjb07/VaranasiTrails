import { Link } from 'react-router'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Container } from '@/components/layout/Container'
import { offers } from '@/data/home'
import { placeholderImages } from '@/data/placeholderMedia'
import { cn } from '@/lib/cn'

/** Two promotion cards: one light, one navy, each with a small photo on the right. */
export const Offers = () => (
  <section className="bg-canvas pb-8 sm:pb-12" aria-labelledby="offers-title">
    <Container>
      <h2 id="offers-title" className="font-sans text-2xl font-bold tracking-normal text-ink sm:text-[1.75rem]">
        {offers.title}
      </h2>
      <p className="mt-1 text-base text-muted sm:text-lg">{offers.subtitle}</p>

      <ul className="mt-5 grid gap-4 lg:grid-cols-2">
        {offers.items.map((offer) => {
          const dark = offer.tone === 'dark'
          const image = placeholderImages[offer.image]
          return (
            <li
              key={offer.title}
              className={cn(
                'flex min-h-[13.5rem] items-start justify-between gap-5 rounded-lg p-5',
                dark ? 'bg-navy text-ivory' : 'border border-line bg-canvas text-ink',
              )}
            >
              <div className="flex h-full flex-col items-start">
                <p className="text-sm">{offer.label}</p>
                <h3 className={cn('mt-2 font-sans text-xl leading-snug font-bold sm:text-2xl', dark ? 'text-ivory' : 'text-ink')}>
                  {offer.title}
                </h3>
                <p className={cn('mt-2 text-base leading-snug', dark ? 'text-ivory/90' : 'text-ink-soft')}>{offer.text}</p>
                <Link
                  to={offer.to}
                  className={cn(
                    'mt-5 inline-flex h-11 items-center rounded-lg px-4 font-medium transition-colors duration-300',
                    dark ? 'bg-ivory text-navy hover:bg-canvas-alt' : 'bg-brand text-ivory hover:bg-brand-deep',
                  )}
                >
                  {offer.cta}
                </Link>
              </div>
              <ImageWithFallback
                src={image.url}
                alt={image.alt}
                sizes="130px"
                className="hidden size-32 shrink-0 rounded-lg sm:block"
              />
            </li>
          )
        })}
      </ul>
    </Container>
  </section>
)
