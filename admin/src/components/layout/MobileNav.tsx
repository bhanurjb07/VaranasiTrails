import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router'

import { cn } from '@/lib/cn'
import { Brand } from './Brand'
import { navItems } from './navItems'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

/** Slide-in navigation for tablets and phones. */
export const MobileNav = ({ open, onClose }: MobileNavProps) => {
  const ref = useRef<HTMLDialogElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Close after navigating.
  useEffect(onClose, [pathname, onClose])

  return (
    <dialog
      ref={ref}
      aria-label="Navigation"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-indigo p-0 text-white backdrop:bg-indigo-deep/60 lg:hidden"
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
            <Brand />
            <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-control p-2 text-white/70 hover:bg-white/10">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto p-3">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-control px-3 py-3 text-sm font-medium',
                    isActive ? 'bg-saffron text-indigo' : 'text-white/75 hover:bg-white/10',
                  )
                }
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </dialog>
  )
}
