import { MoreHorizontal, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

export interface MenuItem {
  label: string
  icon?: LucideIcon
  onSelect: () => void
  danger?: boolean
  hidden?: boolean
  disabled?: boolean
}

interface MenuProps {
  items: readonly MenuItem[]
  label: string
  className?: string
}

/** "..." button that opens a small action menu. Closes on outside click and Escape. */
export const Menu = ({ items, label, className }: MenuProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const visible = items.filter((item) => !item.hidden)

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex size-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-cream-deep hover:text-indigo"
      >
        <MoreHorizontal className="size-5" aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-card border border-line bg-surface py-1 shadow-lift">
          {visible.map(({ label: itemLabel, icon: Icon, onSelect, danger, disabled }) => (
            <button
              key={itemLabel}
              role="menuitem"
              type="button"
              disabled={disabled}
              onClick={() => {
                setOpen(false)
                onSelect()
              }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors disabled:opacity-50',
                danger ? 'text-danger hover:bg-danger-soft' : 'text-indigo hover:bg-cream',
              )}
            >
              {Icon && <Icon className="size-4" aria-hidden="true" />}
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
