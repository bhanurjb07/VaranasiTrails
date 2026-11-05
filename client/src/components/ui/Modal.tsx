import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

/** Native <dialog>: focus trap, Escape to close and an inert background come built in. */
export const Modal = ({ open, onClose, title, description, children, className }: ModalProps) => {
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
        'm-auto w-[calc(100%-2rem)] max-w-lg rounded-card bg-surface p-0 text-ink shadow-lift',
        'backdrop:bg-indigo/60 backdrop:backdrop-blur-sm',
        className,
      )}
    >
      {open && (
        <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-2xl">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-full p-2 text-muted transition-colors hover:bg-cream-deep hover:text-indigo"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
