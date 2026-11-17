import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router'

import { cn } from '@/lib/cn'
import { Brand } from './Brand'
import { navGroups } from './navItems'

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
      className="bg-navy m-0 h-dvh max-h-none w-72 max-w-[85vw] p-0 text-ivory open:animate-[slide-in-left_0.32s_var(--ease-out-soft)] backdrop:bg-navy-deep/60 lg:hidden"
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-ivory/10 px-5">
            <Brand />
            <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-control p-2 text-ivory/70 hover:bg-ivory/10">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Main" className="flex-1 overflow-y-auto p-3">
            {navGroups.map((group, index) => (
              <div key={group.title ?? 'top'} className={cn(index > 0 && 'mt-4')}>
                {group.title && <p className="mb-1 px-3 text-xs font-medium text-ivory/55">{group.title}</p>}
                <div className="space-y-1">
                  {group.items.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium',
                          isActive ? 'bg-ivory/10 text-ivory shadow-[inset_1px_0_0_var(--color-brand)]' : 'text-ivory/75 hover:bg-ivory/5',
                        )
                      }
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      {label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </dialog>
  )
}
