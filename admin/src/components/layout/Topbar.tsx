import { ChevronDown, ExternalLink, LogOut, Menu, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { useAuth } from '@/features/auth/useAuth'
import { env } from '@/lib/env'
import { Breadcrumbs } from './Breadcrumbs'

export const Topbar = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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

  const item = 'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink transition-colors hover:bg-canvas-alt'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line/70 bg-canvas/80 px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="rounded-control p-2 text-ink hover:bg-canvas-alt lg:hidden"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <a
          href={env.publicSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-control px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-canvas-alt sm:flex"
        >
          Open public site <ExternalLink className="size-4" aria-hidden="true" />
        </a>

        <div ref={ref} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-2 rounded-control py-1 pr-2 pl-1 hover:bg-canvas-alt"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-navy text-sm font-semibold text-ivory">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden max-w-32 truncate text-sm font-medium text-ink md:inline">{user?.name}</span>
            <ChevronDown className="size-4 text-muted" aria-hidden="true" />
          </button>

          {open && (
            <div role="menu" className="animate-enter absolute right-0 mt-2 w-60 origin-top-right overflow-hidden rounded-card border border-line bg-paper py-1 ">
              <p className="truncate border-b border-line px-4 py-3 text-xs text-muted">{user?.email}</p>
              <Link role="menuitem" to="/account" className={item} onClick={() => setOpen(false)}>
                <UserRound className="size-4" aria-hidden="true" /> Account
              </Link>
              <a role="menuitem" href={env.publicSiteUrl} target="_blank" rel="noopener noreferrer" className={`${item} sm:hidden`}>
                <ExternalLink className="size-4" aria-hidden="true" /> Open public site
              </a>
              <button
                role="menuitem"
                type="button"
                className={item}
                onClick={async () => {
                  setOpen(false)
                  await logout()
                  navigate('/login')
                }}
              >
                <LogOut className="size-4" aria-hidden="true" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
