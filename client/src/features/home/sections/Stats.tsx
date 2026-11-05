import { Container } from '@/components/layout/Container'
import { stats } from '@/data/home'

export const Stats = () => (
  <section className="bg-indigo py-16 text-white" aria-label="VaranasiTrails in numbers">
    <Container>
      <dl className="grid grid-cols-2 gap-y-10 text-center lg:grid-cols-4">
        {stats.items.map((item) => (
          <div key={item.label}>
            <dd className="font-heading text-4xl font-semibold text-saffron sm:text-5xl">{item.value}</dd>
            <dt className="mt-2 text-sm tracking-wide text-white/75 uppercase">{item.label}</dt>
          </div>
        ))}
      </dl>
    </Container>
  </section>
)
