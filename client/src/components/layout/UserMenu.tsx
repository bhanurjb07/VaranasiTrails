import { ChevronDown, Heart, LogOut, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { toast } from '@/components/ui/toast'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/cn'

interface UserMenuProps {
  onDark: boolean
}

export const UserMenu = ({ onDark }: UserMenuProps) => {
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

  if (!user) return null

  const itemClass = 'flex items-center gap-3 px-4 py-2.5 text-sm text-indigo transition-colors hover:bg-cream'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors',
          onDark ? 'text-white hover:bg-white/15' : 'text-indigo hover:bg-indigo/5',
        )}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-saffron font-semibold text-indigo">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-28 truncate text-sm font-medium lg:inline">{user.name.split(' ')[0]}</span>
        <ChevronDown className="size-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-card border border-line bg-surface py-1 shadow-lift"
        >
          <p className="truncate border-b border-line px-4 py-3 text-xs text-muted">{user.email}</p>
          <Link role="menuitem" to="/profile" className={itemClass} onClick={() => setOpen(false)}>
            <User className="size-4" aria-hidden="true" /> Profile
          </Link>
          <Link role="menuitem" to="/wishlist" className={itemClass} onClick={() => setOpen(false)}>
            <Heart className="size-4" aria-hidden="true" /> Wishlist
          </Link>
          <button
            role="menuitem"
            type="button"
            className={cn(itemClass, 'w-full')}
            onClick={async () => {
              setOpen(false)
              await logout()
              toast.success('You have been logged out')
              navigate('/')
            }}
          >
            <LogOut className="size-4" aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
