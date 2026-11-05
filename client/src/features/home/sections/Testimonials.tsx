import { Quote } from 'lucide-react'

import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Container } from '@/components/layout/Container'
import { testimonials } from '@/data/home'

export const Testimonials = () => (
  <section className="py-20 sm:py-28">
    <Container>
      <SectionHeading align="center" eyebrow="Kind words" title={testimonials.title} />

      <ul className="grid gap-6 lg:grid-cols-3">
        {testimonials.items.map((item, index) => (
          <li key={item.name}>
            <Reveal delay={index * 0.1} className="h-full">
              <figure className="flex h-full flex-col rounded-card border border-line/70 bg-surface p-7 shadow-card">
                <Quote className="size-9 text-gold" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-ink">{item.quote}</blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <span className="block font-semibold text-indigo">{item.name}</span>
                  <span className="text-sm text-muted">
                    {item.from} &middot; {item.trip}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </Container>
  </section>
)
