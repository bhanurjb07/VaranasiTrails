import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'

import { SocialIcon, WhatsAppIcon } from '@/components/common/BrandIcons'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { headerLinks } from '@/data/navigation'
import { site } from '@/data/site'
import { activeSocialLinks } from '@/data/social'
import { useAuth } from '@/features/auth/useAuth'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'
import { Logo } from './Logo'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
  const { status, user, logout } = useAuth()
  const { pathname } = useLocation()
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

  const linkClass = 'block rounded-control px-4 py-3 text-lg font-medium text-indigo hover:bg-cream-deep'

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <motion.div
            className="absolute inset-0 bg-indigo/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-[min(22rem,90vw)] flex-col bg-cream p-5 shadow-lift"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <Button variant="ghost" size="sm" aria-label="Close menu" onClick={onClose} className="size-10 px-0">
                <X className="size-6" aria-hidden="true" />
              </Button>
            </div>

            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {headerLinks.map((link) => (
                <Link key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              ))}
              {status === 'authenticated' ? (
                <>
                  <Link to="/wishlist" className={linkClass}>
                    Wishlist
                  </Link>
                  <Link to="/profile" className={linkClass}>
                    Profile{user ? ` (${user.name.split(' ')[0]})` : ''}
                  </Link>
                  <button type="button" className={`${linkClass} w-full text-left`} onClick={() => void logout()}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={linkClass}>
                    Log in
                  </Link>
                  <Link to="/signup" className={linkClass}>
                    Create an account
                  </Link>
                </>
              )}
            </nav>

            <div className="mt-auto space-y-5 pt-8">
              <ButtonLink href={whatsappUrl} variant="whatsapp" size="lg" className="w-full">
                <WhatsAppIcon className="size-5" />
                Chat on WhatsApp
              </ButtonLink>
              <ul className="flex items-center justify-center gap-3" aria-label={`${site.name} on social media`}>
                {activeSocialLinks.map((link) => (
                  <li key={link.platform}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${link.label}: ${link.handle}`}
                      className="flex size-11 items-center justify-center rounded-full bg-indigo text-white transition-colors hover:bg-saffron hover:text-indigo"
                    >
                      <SocialIcon platform={link.platform} className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
