import { SectionHeading } from '@/components/common/SectionHeading'
import { Container } from '@/components/layout/Container'
import { howItWorks } from '@/data/home'
import { homeIcons } from '../homeIcons'

export const HowItWorks = () => (
  <section className="py-8 sm:py-20 md:py-28" aria-labelledby="how-title">
    <Container>
      <SectionHeading align="center" eyebrow="How it works" title={howItWorks.title} subtitle={howItWorks.subtitle} />
      <h2 id="how-title" className="sr-only">
        How it works
      </h2>

      <ol className="relative grid gap-6 md:grid-cols-3 md:gap-10">
        <div className="absolute top-8 right-[16%] left-[16%] hidden border-t-2 border-dashed border-gold/50 md:block" aria-hidden="true" />
        {howItWorks.steps.map((step, index) => {
          const Icon = homeIcons[step.icon]
          return (
            <li key={step.title}>
              <div className="relative flex items-start gap-4 text-left md:flex-col md:items-center md:text-center">
                <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-indigo text-white shadow-lift md:size-16">
                  {Icon && <Icon className="size-7" aria-hidden="true" />}
                  <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-saffron text-xs font-bold text-indigo">
                    {index + 1}
                  </span>
                </span>
                <div>
                  <h3 className="text-lg md:mt-5 md:text-2xl">{step.title}</h3>
                  <p className="mt-1 max-w-xs text-muted md:mt-2">{step.text}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </Container>
  </section>
)
