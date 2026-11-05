import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Container } from '@/components/layout/Container'
import { whyUs } from '@/data/home'
import { homeIcons } from '../homeIcons'

export const WhyUs = () => (
  <section className="bg-cream-deep/60 py-20 sm:py-28">
    <Container>
      <SectionHeading eyebrow="Why VaranasiTrails" title={whyUs.title} subtitle={whyUs.subtitle} />

      <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {whyUs.items.map((item, index) => {
          const Icon = homeIcons[item.icon]
          return (
            <li key={item.title}>
              <Reveal delay={(index % 3) * 0.08}>
                <span className="flex size-12 items-center justify-center rounded-control bg-saffron-soft text-saffron-dark">
                  {Icon && <Icon className="size-6" aria-hidden="true" />}
                </span>
                <h3 className="mt-5 text-xl">{item.title}</h3>
                <p className="mt-2 text-muted">{item.text}</p>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </Container>
  </section>
)
