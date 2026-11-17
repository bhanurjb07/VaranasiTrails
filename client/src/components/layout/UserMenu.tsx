import { ChevronDown, Heart, LogOut, Repeat, User } from 'lucide-react'
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

  const itemClass = 'flex items-center gap-3 px-4 py-3 text-base font-medium text-ink transition-colors duration-200 hover:bg-brand/5 hover:text-brand-text'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-2 rounded-lg py-1 pr-2.5 pl-1 transition-colors duration-500',
          onDark ? "text-ivory hover:bg-ivory/10" : "text-ink hover:bg-ink/5",
        )}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-brand font-semibold text-ivory">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-28 truncate text-sm font-medium lg:inline">{user.name.split(' ')[0]}</span>
        <ChevronDown className="size-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-enter absolute right-0 mt-3 w-64 origin-top-right overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg"
        >
          <p className="truncate border-b border-line px-4 py-3 text-sm text-muted">{user.email}</p>
          <Link role="menuitem" to="/profile" className={itemClass} onClick={() => setOpen(false)}>
            <User className="size-5 text-brand" aria-hidden="true" /> Profile
          </Link>
          <Link role="menuitem" to="/wishlist" className={itemClass} onClick={() => setOpen(false)}>
            <Heart className="size-5 text-brand" aria-hidden="true" /> Wishlist
          </Link>
          <button
            role="menuitem"
            type="button"
            className={cn(itemClass, 'w-full')}
            onClick={async () => {
              setOpen(false)
              await logout()
              navigate('/login')
            }}
          >
            <Repeat className="size-5 text-brand" aria-hidden="true" /> Switch account
          </button>
          <button
            role="menuitem"
            type="button"
            className={cn(itemClass, 'w-full')}
            onClick={async () => {
              setOpen(false)
              await logout()
              toast.success('You have been signed out')
              navigate('/')
            }}
          >
            <LogOut className="size-5 text-brand" aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
