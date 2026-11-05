import { Reveal } from '@/components/common/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Container } from '@/components/layout/Container'
import { howItWorks } from '@/data/home'
import { homeIcons } from '../homeIcons'

export const HowItWorks = () => (
  <section className="py-20 sm:py-28" aria-labelledby="how-title">
    <Container>
      <SectionHeading align="center" eyebrow="How it works" title={howItWorks.title} subtitle={howItWorks.subtitle} />
      <h2 id="how-title" className="sr-only">
        How it works
      </h2>

      <ol className="relative grid gap-10 md:grid-cols-3">
        <div className="absolute top-8 right-[16%] left-[16%] hidden border-t-2 border-dashed border-gold/50 md:block" aria-hidden="true" />
        {howItWorks.steps.map((step, index) => {
          const Icon = homeIcons[step.icon]
          return (
            <li key={step.title}>
              <Reveal delay={index * 0.1} className="relative flex flex-col items-center text-center">
                <span className="relative z-10 flex size-16 items-center justify-center rounded-full bg-indigo text-white shadow-lift">
                  {Icon && <Icon className="size-7" aria-hidden="true" />}
                  <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-saffron text-xs font-bold text-indigo">
                    {index + 1}
                  </span>
                </span>
                <h3 className="mt-5 text-2xl">{step.title}</h3>
                <p className="mt-2 max-w-xs text-muted">{step.text}</p>
              </Reveal>
            </li>
          )
        })}
      </ol>
    </Container>
  </section>
)
