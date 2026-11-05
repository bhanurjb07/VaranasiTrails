import type { ReactNode } from 'react'

import { Card } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'

interface AuthCardProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/** Centered card used by every auth page. */
export const AuthCard = ({ title, subtitle, children, footer }: AuthCardProps) => (
  <Container narrow className="py-10 sm:py-16">
    <Card className="mx-auto max-w-xl p-6 sm:p-10">
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </Card>
    {footer && <p className="mt-6 text-center text-muted">{footer}</p>}
  </Container>
)
