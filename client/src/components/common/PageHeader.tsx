import type { ReactNode } from 'react'

import { Container } from '@/components/layout/Container'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  children?: ReactNode
}

/** Title band used at the top of content and listing pages. */
export const PageHeader = ({ eyebrow, title, subtitle, children }: PageHeaderProps) => (
  <div className="border-b border-line/70 bg-cream-deep/50 py-12 sm:py-16">
    <Container>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-saffron-dark uppercase">{eyebrow}</p>
      )}
      <h1 className="text-balance text-4xl sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-2xl text-lg text-muted">{subtitle}</p>}
      {children}
    </Container>
  </div>
)
