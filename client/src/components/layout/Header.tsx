import { Menu } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'

import { WhatsAppIcon } from '@/components/common/BrandIcons'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { headerLinks } from '@/data/navigation'
import { useAuth } from '@/features/auth/useAuth'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'
import { useScrolledPast } from '@/hooks/useScrollPosition'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { UserMenu } from './UserMenu'

export const Header = () => {
  const { pathname } = useLocation()
  const { status } = useAuth()
  const scrolled = useScrolledPast(24)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const whatsappUrl = useGeneralWhatsAppUrl()

  // Only the home page has a full-bleed dark hero for the bar to sit over.
  const overHero = pathname === '/' && !scrolled

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-all duration-300',
          overHero
            ? 'bg-gradient-to-b from-indigo/70 to-transparent py-4'
            : 'border-b border-line/70 bg-cream/85 py-2.5 shadow-card backdrop-blur-lg',
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Logo invert={overHero} />

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {headerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    overHero ? 'text-white hover:bg-white/15' : 'text-indigo hover:bg-indigo/5',
                    isActive && (overHero ? 'bg-white/15' : 'bg-saffron-soft text-saffron-dark'),
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href={whatsappUrl} variant="whatsapp" size="sm" className="hidden sm:inline-flex">
              <WhatsAppIcon className="size-4" />
              Chat on WhatsApp
            </ButtonLink>

            {status === 'authenticated' ? (
              <UserMenu onDark={overHero} />
            ) : (
              status === 'anonymous' && (
                <Link
                  to="/login"
                  className={cn(
                    'hidden rounded-full px-4 py-2 text-sm font-semibold transition-colors md:inline-block',
                    overHero ? 'text-white hover:bg-white/15' : 'text-indigo hover:bg-indigo/5',
                  )}
                >
                  Log in
                </Link>
              )
            )}

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className={cn(
                'inline-flex size-11 items-center justify-center rounded-full md:hidden',
                overHero ? 'text-white hover:bg-white/15' : 'text-indigo hover:bg-indigo/5',
              )}
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  )
}
