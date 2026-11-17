import type { ReactNode } from 'react'

import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Container } from '@/components/layout/Container'
import { placeholderImages } from '@/data/placeholderMedia'

interface AuthCardProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

const perks = ['Save trips to your wishlist', 'Day-by-day plans with clear prices', 'Book in one tap on WhatsApp'] as const

/**
 * Shared frame for every auth page: a photograph of the ghats beside the form on wide
 * screens, and a short photo band above it on phones.
 */
export const AuthCard = ({ title, subtitle, children, footer }: AuthCardProps) => {
  const image = placeholderImages.ghatSunrise

  return (
    <Container className="py-4 max-sm:px-0 sm:py-16">
      <div className="animate-enter mx-auto grid max-w-5xl overflow-hidden border-line bg-canvas sm:rounded-lg sm:border lg:grid-cols-[1fr_1.05fr]">
        <aside className="relative isolate flex min-h-36 flex-col justify-end overflow-hidden bg-navy-deep p-5 text-ivory sm:min-h-52 sm:p-10 lg:min-h-[38rem] lg:p-12">
          <ImageWithFallback
            src={image.url}
            alt=""
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="absolute inset-0 -z-20 size-full"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep/90 via-navy-deep/40 to-navy-deep/10" />
          <p className="max-w-sm font-sans text-2xl leading-tight font-bold text-ivory sm:text-3xl">
            Your journey along the Ganga starts here.
          </p>
          <ul className="mt-8 hidden border-t border-ivory/20 lg:block">
            {perks.map((text) => (
              <li key={text} className="border-b border-ivory/20 py-3 text-base text-ivory/90">
                {text}
              </li>
            ))}
          </ul>
        </aside>

        <div className="p-5 sm:p-10 lg:p-14">
          <h1 className="font-sans text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-base text-muted">{subtitle}</p>}
          <div className="mt-6 sm:mt-10">{children}</div>
          {footer && <p className="mt-8 border-t border-line pt-5 text-center text-sm text-muted sm:mt-10 sm:pt-6">{footer}</p>}
        </div>
      </div>
    </Container>
  )
}
