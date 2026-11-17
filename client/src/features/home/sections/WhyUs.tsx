import { Container } from '@/components/layout/Container'
import { whyUs } from '@/data/home'
import { whyIllustrations } from '../whyIllustrations'

/**
 * Four plain cards under the search bar: what a visitor can rely on before they
 * message us. Grey cards, a blue icon, a bold line and one sentence.
 */
export const WhyUs = () => (
  <section className="bg-canvas py-8 sm:py-12" aria-labelledby="why-title">
    <Container>
      <h2 id="why-title" className="font-sans text-2xl font-bold tracking-normal text-ink sm:text-[1.75rem]">
        {whyUs.title}
      </h2>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {whyUs.items.map((item) => {
          return (
            <li key={item.title} className="rounded-lg border border-line bg-canvas-alt p-6">
              <span className="block size-16">{whyIllustrations[item.icon]}</span>
              <h3 className="mt-6 font-sans text-lg leading-snug font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-base leading-snug text-ink-soft">{item.text}</p>
            </li>
          )
        })}
      </ul>
    </Container>
  </section>
)
