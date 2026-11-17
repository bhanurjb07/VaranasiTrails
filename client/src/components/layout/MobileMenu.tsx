import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, LogOut, Repeat, X } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

import { SocialIcon, WhatsAppIcon } from '@/components/common/BrandIcons'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { toast } from '@/components/ui/toast'
import { headerLinks } from '@/data/navigation'
import { site } from '@/data/site'
import { activeSocialLinks } from '@/data/social'
import { useAuth } from '@/features/auth/useAuth'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'
import { cn } from '@/lib/cn'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

const rowClass =
  'flex w-full items-center gap-3 rounded-control px-3 py-3.5 text-left text-base font-medium text-ink hover:bg-canvas-alt'

export const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
  const { status, user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const whatsappUrl = useGeneralWhatsAppUrl()

  // Close when navigating.
  useEffect(onClose, [pathname, onClose])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const signOut = async () => {
    await logout()
    onClose()
    toast.success('You have been signed out')
    navigate('/')
  }

  // Signs out of this account and goes straight to the login page for another one.
  const switchAccount = async () => {
    await logout()
    onClose()
    navigate('/login')
  }

  const firstName = user?.name.split(' ')[0]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <motion.div
            className="absolute inset-0 bg-navy-deep/60 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute inset-y-0 left-0 flex w-[min(22rem,90vw)] flex-col bg-canvas "
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-navy flex items-center justify-between px-5 py-5 text-ivory">
              <p className="font-sans text-xl font-bold">
                {status === 'authenticated' && firstName ? `Hello, ${firstName}` : 'Welcome'}
              </p>
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="-mr-2 inline-flex size-10 items-center justify-center rounded-control text-ivory transition-colors hover:bg-ivory/15"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {status === 'authenticated' && user ? (
                <section aria-labelledby="menu-profile" className="rounded-lg border border-line bg-paper p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 id="menu-profile" className="font-sans text-lg font-bold text-ink">
                      Profile
                    </h2>
                    <Link
                      to="/profile"
                      className="rounded-control border border-ink/25 px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-canvas-alt"
                    >
                      See all
                    </Link>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy text-lg font-semibold text-ivory">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{user.name}</p>
                      <p className="text-sm text-muted">Account holder</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-line pt-1">
                    <button type="button" className={rowClass} onClick={() => void switchAccount()}>
                      <Repeat className="size-5 text-muted" aria-hidden="true" />
                      Switch account
                    </button>
                    <button type="button" className={rowClass} onClick={() => void signOut()}>
                      <LogOut className="size-5 text-muted" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                </section>
              ) : (
                status === 'anonymous' && (
                  <section aria-label="Account" className="rounded-lg border border-line bg-paper p-4">
                    <p className="text-sm text-muted">Sign in to save trips and write reviews.</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <ButtonLink to="/login" size="md" className="w-full">
                        Log in
                      </ButtonLink>
                      <ButtonLink to="/signup" variant="outline" size="md" className="w-full">
                        Sign up
                      </ButtonLink>
                    </div>
                  </section>
                )
              )}

              <nav aria-label="Mobile" className={cn('flex flex-col', status !== 'loading' && 'mt-5')}>
                {headerLinks.map((link) => (
                  <Link key={link.to} to={link.to} className={cn(rowClass, 'justify-between')}>
                    {link.label}
                    <ChevronRight className="size-5 text-muted" aria-hidden="true" />
                  </Link>
                ))}
                {status === 'authenticated' && (
                  <Link to="/wishlist" className={cn(rowClass, 'justify-between')}>
                    Wishlist
                    <ChevronRight className="size-5 text-muted" aria-hidden="true" />
                  </Link>
                )}
              </nav>
            </div>

            <div className="space-y-4 border-t border-line p-5">
              <ButtonLink href={whatsappUrl} variant="whatsapp" size="lg" className="w-full">
                <WhatsAppIcon className="size-5" />
                Chat on WhatsApp
              </ButtonLink>
              {activeSocialLinks.length > 0 && (
                <ul className="flex items-center justify-center gap-3" aria-label={`${site.name} on social media`}>
                  {activeSocialLinks.map((link) => (
                    <li key={link.platform}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${link.label}: ${link.handle}`}
                        className="flex size-11 items-center justify-center rounded-control border border-line text-ink transition-colors hover:bg-canvas-alt"
                      >
                        <SocialIcon platform={link.platform} className="size-5" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
