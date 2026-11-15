import { Menu } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'

import { WhatsAppIcon } from '@/components/common/BrandIcons'
import { ThemeToggle } from '@/components/common/ThemeToggle'
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

  // From md up, the home page lets the 3D hero show through a clear bar until you scroll.
  // On phones the bar is always solid.
  const overHero = pathname === '/' && !scrolled

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,padding] duration-500 ease-[var(--ease-out-soft)]',
          'border-line/60 bg-cream/85 backdrop-blur-xl md:py-2.5',
          overHero && 'md:border-transparent md:bg-transparent md:py-4 md:backdrop-blur-none',
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-8 md:gap-4 md:px-5 md:py-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-full text-indigo transition-colors hover:bg-indigo/6 md:hidden"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
            <Logo className="md:hidden [&_span]:text-xl [&_svg]:size-8" />
            <Logo invert={overHero} className="hidden md:inline-flex" />
          </div>

          <nav
            aria-label="Main"
            className={cn(
              'hidden items-center gap-0.5 rounded-full p-1 ring-1 transition-colors duration-500 md:flex',
              overHero ? 'bg-white/8 ring-white/15 backdrop-blur-md' : 'bg-cream-deep/70 ring-line/60',
            )}
          >
            {headerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200',
                    overHero ? 'text-white/80 hover:text-white' : 'text-muted hover:text-indigo',
                    isActive && (overHero ? 'bg-white/15 text-white' : 'bg-surface text-indigo shadow-card'),
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <ThemeToggle onDark={overHero} className="max-md:hidden" />
            <ButtonLink href={whatsappUrl} variant="whatsapp" size="sm" className="hidden md:inline-flex">
              <WhatsAppIcon className="size-4" />
              <span className="hidden lg:inline">Chat on WhatsApp</span>
              <span className="sr-only lg:hidden">Chat on WhatsApp</span>
            </ButtonLink>

            <ThemeToggle className="md:hidden" />
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="inline-flex size-11 items-center justify-center rounded-full text-whatsapp-dark transition-colors hover:bg-indigo/6 md:hidden"
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
                      'inline-block rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                      overHero ? 'text-white hover:bg-white/15' : 'text-indigo hover:bg-indigo/6',
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
