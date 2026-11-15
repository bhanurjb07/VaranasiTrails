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
  <div className="relative isolate overflow-hidden border-b border-line/70 bg-cream-deep/50 py-6 sm:py-16">
    <div
      aria-hidden="true"
      className="absolute -top-32 -right-24 -z-10 size-96 rounded-full bg-saffron-bright/15 blur-3xl"
    />
    <div aria-hidden="true" className="absolute -bottom-40 -left-24 -z-10 size-80 rounded-full bg-river/10 blur-3xl" />
    <Container className="animate-enter">
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-saffron-dark uppercase">{eyebrow}</p>
      )}
      <h1 className="text-balance text-3xl sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-base sm:mt-4 sm:text-lg text-muted">{subtitle}</p>}
      {children}
    </Container>
  </div>
)
