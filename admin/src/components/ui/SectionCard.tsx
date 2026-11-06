import type { ReactNode } from 'react'

import { Card } from './Card'

interface SectionCardProps {
  id?: string
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

/** A titled card; `id` makes it an anchor target for the readiness checklist. */
export const SectionCard = ({ id, title, description, actions, children }: SectionCardProps) => (
  <Card className="scroll-mt-40 p-5 sm:p-6">
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={id ? `${id}-title` : undefined} className="text-xl">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  </Card>
)
