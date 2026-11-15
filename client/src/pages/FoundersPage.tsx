import { PageHeader } from '@/components/common/PageHeader'
import { SeoHead } from '@/components/common/SeoHead'
import { Container } from '@/components/layout/Container'
import { founders } from '@/data/founder'
import { FounderCard } from '@/features/founders/FounderCard'

export const FoundersPage = () => (
  <>
    <SeoHead title="Founders" description="The founders of VaranasiTrails: who they are and how to reach them." path="/founders" />
    <PageHeader eyebrow="Founders" title="The people behind VaranasiTrails" subtitle="Who started the company, and how to reach them directly." />

    <Container className="py-6 sm:py-12">
      <ul className="grid gap-6 md:grid-cols-2 md:gap-8">
        {founders.map((founder, index) => (
          <li key={founder.id}>
            <FounderCard founder={founder} priority={index === 0} />
          </li>
        ))}
      </ul>
    </Container>
  </>
)
