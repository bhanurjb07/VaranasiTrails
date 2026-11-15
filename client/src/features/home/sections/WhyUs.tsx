import { SectionHeading } from '@/components/common/SectionHeading'
import { Container } from '@/components/layout/Container'
import { whyUs } from '@/data/home'
import { homeIcons } from '../homeIcons'

export const WhyUs = () => (
  <section className="bg-cream-deep/60 py-8 sm:py-20 md:py-28">
    <Container>
      <SectionHeading eyebrow="Trip details" title={whyUs.title} />

      <ul className="grid gap-y-6 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-4">
        {whyUs.items.map((item) => {
          const Icon = homeIcons[item.icon]
          return (
            <li key={item.title} className="reveal">
              <div className="flex items-start gap-4 sm:block">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-saffron-soft text-saffron-dark ring-1 ring-saffron/15">
                  {Icon && <Icon className="size-6" aria-hidden="true" />}
                </span>
                <div>
                  <h3 className="text-lg sm:mt-5 sm:text-xl">{item.title}</h3>
                  <p className="mt-1 text-muted sm:mt-2">{item.text}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </Container>
  </section>
)
