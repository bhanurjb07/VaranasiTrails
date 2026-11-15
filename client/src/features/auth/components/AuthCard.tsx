import { CalendarDays, Heart, MessageCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { SkylineArt } from '@/components/common/SkylineArt'
import { Container } from '@/components/layout/Container'
import { LogoMark } from '@/components/layout/Logo'
import { site } from '@/data/site'

interface AuthCardProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

const perks = [
  { icon: Heart, text: 'Save trips to your wishlist' },
  { icon: CalendarDays, text: 'Day-by-day plans with clear prices' },
  { icon: MessageCircle, text: 'Book in one tap on WhatsApp' },
] as const

/**
 * Shared frame for every auth page: a dusk brand panel beside the form on wide
 * screens, and a short dusk banner above the form on phones.
 */
export const AuthCard = ({ title, subtitle, children, footer }: AuthCardProps) => (
  <Container className="py-6 sm:py-12">
    <div className="animate-enter mx-auto grid max-w-5xl overflow-hidden rounded-[1.75rem] border border-line/80 bg-surface shadow-lift lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="bg-dusk relative isolate overflow-hidden px-6 pt-7 pb-24 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:p-12 lg:pb-44">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-20 -z-10 size-72 rounded-full bg-saffron-bright/25 blur-3xl animate-[float-glow_9s_ease-in-out_infinite]"
        />
        <div className="flex items-center gap-3">
          <LogoMark className="size-10 ring-1 ring-white/15 rounded-[11px]" />
          <p className="font-heading text-xl font-semibold">
            {site.logoText}
            <span className="text-glow">{site.logoAccent}</span>
          </p>
        </div>

        <div className="relative mt-6 lg:mt-0">
          <p className="max-w-sm font-heading text-2xl leading-snug text-white sm:text-3xl lg:text-4xl">
            Your journey along the <span className="text-glow">Ganga</span> starts here.
          </p>
          <ul className="mt-8 hidden space-y-3.5 lg:block">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/80">
                <span className="flex size-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <Icon className="size-4 text-gold" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <SkylineArt className="absolute inset-x-0 bottom-0 -z-10 h-28 opacity-90 lg:h-44" />
      </aside>

      <div className="relative -mt-14 rounded-t-[1.75rem] bg-surface p-6 sm:p-10 lg:mt-0 lg:rounded-none lg:p-14">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <p className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">{footer}</p>}
      </div>
    </div>
  </Container>
)
