import { useId, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface TabItem {
  id: string
  label: ReactNode
  panel: ReactNode
}

interface TabsProps {
  items: readonly TabItem[]
  value: string
  onChange: (id: string) => void
  className?: string
}

export const Tabs = ({ items, value, onChange, className }: TabsProps) => {
  const base = useId()

  const move = (index: number, delta: number) => {
    const next = items[(index + delta + items.length) % items.length]
    if (next) onChange(next.id)
  }

  return (
    <div className={className}>
      <div role="tablist" className="mb-3 flex gap-2">
        {items.map((item, index) => {
          const selected = item.id === value
          return (
            <button
              key={item.id}
              id={`${base}-${item.id}-tab`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${base}-${item.id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.id)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') move(index, 1)
                if (event.key === 'ArrowLeft') move(index, -1)
              }}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                selected ? 'bg-indigo text-white' : 'bg-cream-deep text-indigo hover:bg-line',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${base}-${item.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${base}-${item.id}-tab`}
          hidden={item.id !== value}
        >
          {item.id === value ? item.panel : null}
        </div>
      ))}
    </div>
  )
}
