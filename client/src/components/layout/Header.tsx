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
import { MobileSearchBar } from './MobileSearchBar'
import { UserMenu } from './UserMenu'

export const Header = () => {
  const { pathname } = useLocation()
  const { status } = useAuth()
  const scrolled = useScrolledPast(24)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const whatsappUrl = useGeneralWhatsAppUrl()

  // From md up, the home page lets a dark hero sit under the bar. On phones the bar is always solid.
  const overHero = pathname === '/' && !scrolled

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300',
          'border-line/70 bg-cream shadow-card md:py-2.5 md:backdrop-blur-lg',
          overHero && 'md:border-transparent md:bg-indigo/50 md:py-4 md:shadow-none',
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-8 md:gap-4 md:px-5 md:py-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-control text-indigo hover:bg-indigo/5 md:hidden"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
            <Logo invert={false} className="md:hidden [&_svg]:size-8 [&_span]:text-xl" />
            <Logo invert={overHero} className="hidden md:inline-flex" />
          </div>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {headerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-control px-4 py-2 text-sm font-medium transition-colors',
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
            <ButtonLink href={whatsappUrl} variant="whatsapp" size="sm" className="hidden md:inline-flex">
              <WhatsAppIcon className="size-4" />
              <span className="hidden lg:inline">Chat on WhatsApp</span>
              <span className="sr-only lg:hidden">Chat on WhatsApp</span>
            </ButtonLink>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="inline-flex size-11 items-center justify-center rounded-control text-whatsapp-dark hover:bg-indigo/5 md:hidden"
            >
              <WhatsAppIcon className="size-6" />
            </a>

            <div className="hidden md:block">
              {status === 'authenticated' ? (
                <UserMenu onDark={overHero} />
              ) : (
                status === 'anonymous' && (
                  <Link
                    to="/login"
                    className={cn(
                      'inline-block rounded-control px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                      overHero ? 'text-white hover:bg-white/15' : 'text-indigo hover:bg-indigo/5',
                    )}
                  >
                    Log in
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

        <MobileSearchBar />
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  )
}
