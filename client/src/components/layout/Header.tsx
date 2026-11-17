import { Menu, MessageCircle } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, NavLink } from 'react-router'

import { headerLinks } from '@/data/navigation'
import { useAuth } from '@/features/auth/useAuth'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { MobileSearchBar } from './MobileSearchBar'
import { UserMenu } from './UserMenu'

// Booking-style bar: solid deep blue, white text, white outlined buttons.
const linkClass = (active: boolean) =>
  cn(
    'rounded-lg px-3 py-2 text-base font-medium text-ivory transition-colors duration-300 hover:bg-ivory/10',
    active && 'bg-ivory/10',
  )

const buttonClass =
  'inline-flex h-10 items-center rounded-lg border border-ivory bg-ivory px-4 text-base font-medium text-navy transition-colors duration-300 hover:bg-canvas-alt'

export const Header = () => {
  const { status } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const whatsappUrl = useGeneralWhatsAppUrl()

  return (
    <>
      <header className="fixed inset-x-0 top-2 z-40 px-2 text-ivory sm:px-6 md:top-3">
        <div className="mx-auto w-full max-w-7xl rounded-3xl border border-ivory/10 bg-navy shadow-lg md:rounded-full">
        <div className="flex w-full items-center justify-between gap-4 px-3 py-2 sm:px-6 md:px-6">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-lg text-ivory hover:bg-ivory/10 md:hidden"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
            <Logo invert />
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {headerLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => linkClass(isActive)}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center rounded-lg bg-[#25d366] px-4 text-base font-bold text-[#06291a] transition-colors duration-300 hover:bg-[#1ebe5a] md:inline-flex"
            >
              WhatsApp
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="inline-flex size-10 items-center justify-center rounded-lg bg-[#25d366] text-[#06291a] hover:bg-[#1ebe5a] md:hidden"
            >
              <MessageCircle className="size-[1.4rem]" aria-hidden="true" />
            </a>

            <div className="ml-2 hidden items-center gap-2 md:flex">
              {status === 'authenticated' ? (
                <UserMenu onDark />
              ) : (
                status === 'anonymous' && (
                  <>
                    <Link to="/signup" className={buttonClass}>
                      Sign up
                    </Link>
                    <Link to="/login" className={buttonClass}>
                      Log in
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        </div>

        <MobileSearchBar />
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  )
}
