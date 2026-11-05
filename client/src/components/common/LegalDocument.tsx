import { Container } from '@/components/layout/Container'
import { legalUpdated, type LegalSection } from '@/data/legal'
import { PageHeader } from './PageHeader'
import { SeoHead } from './SeoHead'

interface LegalDocumentProps {
  title: string
  path: string
  sections: readonly LegalSection[]
}

export const LegalDocument = ({ title, path, sections }: LegalDocumentProps) => (
  <>
    <SeoHead title={title} path={path} />
    <PageHeader title={title} subtitle={`Last updated ${legalUpdated}`} />
    <Container narrow className="space-y-10 py-12">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="mb-3 text-2xl">{section.heading}</h2>
          <div className="space-y-3 text-ink/90">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}
    </Container>
  </>
)
