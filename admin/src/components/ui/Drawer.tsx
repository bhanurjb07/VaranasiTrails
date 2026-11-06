import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/** Slide-over panel on a native <dialog> (focus trap, Escape and inert background built in). */
export const Drawer = ({ open, onClose, title, description, children, footer, className }: DrawerProps) => {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className={cn(
        'm-0 mr-0 ml-auto h-dvh max-h-none w-full max-w-lg bg-surface p-0 text-ink shadow-lift',
        'open:animate-[slide-in-right_0.22s_ease-out] backdrop:bg-indigo-deep/50 backdrop:backdrop-blur-[2px]',
        className,
      )}
    >
      {open && (
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              <h2 id={titleId} className="text-xl">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="rounded-control p-2 text-muted transition-colors hover:bg-cream hover:text-indigo"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <footer className="border-t border-line px-6 py-4">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}
