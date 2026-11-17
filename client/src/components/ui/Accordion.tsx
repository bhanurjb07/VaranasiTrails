import { Plus } from 'lucide-react'
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

/** Separate bordered rows with a bold question and a blue plus that turns into a cross when open. */
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
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id)
        const panelId = `${base}-${item.id}-panel`
        const buttonId = `${base}-${item.id}-button`

        return (
          <div key={item.id} className="rounded-lg border border-line bg-canvas">
            <h3 className="font-sans text-base">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:gap-6 sm:px-5"
              >
                <span className="font-sans text-base leading-snug font-bold text-ink sm:text-lg">
                  {item.title}
                </span>
                <Plus
                  className={cn(
                    'size-5 shrink-0 text-brand transition-transform duration-300 ease-out',
                    isOpen && 'rotate-45',
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div
                  className={cn(
                    'max-w-3xl px-4 pb-4 text-base leading-relaxed text-ink-soft transition-opacity duration-300 ease-out sm:px-5 sm:pb-5',
                    isOpen ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
