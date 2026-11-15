import { Compass, Heart, House, User, type LucideIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'

import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/cn'

interface Tab {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

/** Phone-only tab bar fixed to the bottom of the screen. Hidden from md up. */
export const BottomNav = () => {
  const { pathname } = useLocation()
  const { status } = useAuth()

  // A trip page has its own bottom bar with the price and the booking button.
  if (/^\/destinations\/[^/]+/.test(pathname)) return null

  const tabs: Tab[] = [
    { to: '/', label: 'Home', icon: House, end: true },
    { to: '/destinations', label: 'Trips', icon: Compass, end: true },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    status === 'authenticated'
      ? { to: '/profile', label: 'Account', icon: User }
      : { to: '/login', label: 'Log in', icon: User },
  ]

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'relative flex h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold',
                  isActive ? 'text-saffron-dark' : 'text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-x-6 top-0 h-0.5 bg-saffron" aria-hidden="true" />}
                  <Icon className="size-6" aria-hidden="true" />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
