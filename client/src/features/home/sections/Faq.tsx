import { SectionHeading } from '@/components/common/SectionHeading'
import { Container } from '@/components/layout/Container'
import { Accordion } from '@/components/ui/Accordion'
import { faq } from '@/data/home'

export const Faq = () => (
  <section className="bg-cream-deep/60 py-20 sm:py-28" aria-labelledby="faq-title">
    <Container narrow>
      <SectionHeading align="center" eyebrow="FAQ" title={faq.title} />
      <h2 id="faq-title" className="sr-only">
        Frequently asked questions
      </h2>
      <Accordion
        items={faq.items.map((item, index) => ({
          id: String(index),
          title: item.q,
          content: item.a,
        }))}
      />
    </Container>
  </section>
)
