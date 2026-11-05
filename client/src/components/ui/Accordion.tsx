import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface AccordionItem {
  id: string
  title: ReactNode
  content: ReactNode
}

interface AccordionProps {
  items: readonly AccordionItem[]
  /** ids open on first render */
  defaultOpen?: readonly string[]
  multiple?: boolean
  className?: string
}

export const Accordion = ({ items, defaultOpen = [], multiple = false, className }: AccordionProps) => {
  const [open, setOpen] = useState<readonly string[]>(defaultOpen)
  const base = useId()

  const toggle = (id: string) =>
    setOpen((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : multiple
          ? [...current, id]
          : [id],
    )

  return (
    <div className={cn('divide-y divide-line rounded-card border border-line bg-surface', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id)
        const panelId = `${base}-${item.id}-panel`
        const buttonId = `${base}-${item.id}-button`

        return (
          <div key={item.id}>
            <h3 className="font-sans text-base">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-indigo transition-colors hover:bg-cream/60"
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={cn('size-5 shrink-0 text-saffron-dark transition-transform', isOpen && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                'grid transition-[grid-template-rows] duration-300',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-muted">{item.content}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
