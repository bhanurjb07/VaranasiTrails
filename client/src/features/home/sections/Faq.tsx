import { Container } from '@/components/layout/Container'
import { Accordion } from '@/components/ui/Accordion'
import { faq } from '@/data/home'

export const Faq = () => (
  <section className="bg-canvas py-8 sm:py-12" aria-labelledby="faq-title">
    <Container>
      <h2 id="faq-title" className="font-sans text-2xl font-bold tracking-normal text-ink sm:text-[1.75rem]">
        {faq.title}
      </h2>
      <Accordion
        className="mt-5"
        items={faq.items.map((item, index) => ({
          id: String(index),
          title: item.q,
          content: item.a,
        }))}
      />
    </Container>
  </section>
)
