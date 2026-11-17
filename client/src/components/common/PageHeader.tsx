import type { ReactNode } from 'react'

import { Container } from '@/components/layout/Container'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  children?: ReactNode
}

/** Deep-blue title band at the top of content and listing pages, like Booking's header area. */
export const PageHeader = ({ eyebrow, title, subtitle, children }: PageHeaderProps) => (
  <div className="bg-navy py-8 text-ivory sm:py-12">
    <Container className="animate-enter">
      {eyebrow && <p className="mb-2 text-sm text-ivory/90">{eyebrow}</p>}
      <h1 className="text-balance font-sans text-3xl leading-tight font-bold text-ivory sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-base text-ivory/90 sm:mt-3 sm:text-lg">{subtitle}</p>}
      {children}
    </Container>
  </div>
)
