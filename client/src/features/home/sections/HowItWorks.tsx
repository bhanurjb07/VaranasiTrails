import { Container } from '@/components/layout/Container'
import { howItWorks } from '@/data/home'

/** Three small numbered cards in one row, styled like the "Why VaranasiTrails?" cards. */
export const HowItWorks = () => (
  <section className="bg-canvas py-8 sm:py-12" aria-labelledby="how-title">
    <Container>
      <h2 id="how-title" className="font-sans text-2xl font-bold tracking-normal text-ink sm:text-[1.75rem]">
        {howItWorks.title}
      </h2>
      <p className="mt-1 text-base text-muted sm:text-lg">{howItWorks.subtitle}</p>

      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {howItWorks.steps.map((step, index) => (
          <li key={step.title} className="flex items-start gap-4 rounded-lg border border-line bg-canvas-alt p-5">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold font-sans text-lg font-bold text-navy-deep"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div>
              <h3 className="font-sans text-lg leading-snug font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-base leading-snug text-ink-soft">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Container>
  </section>
)
