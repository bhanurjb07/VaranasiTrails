import { Link } from 'react-router'

import { SocialIcon } from '@/components/common/BrandIcons'
import { contact } from '@/data/contact'
import { footerGroups } from '@/data/navigation'
import { site } from '@/data/site'
import { activeSocialLinks } from '@/data/social'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'
import { Container } from './Container'
import { Logo } from './Logo'

const currentYear = new Date().getFullYear()

const heading = 'mb-4 font-sans text-base font-bold text-ink'
const linkClass = 'text-base text-ink transition-colors duration-200 hover:text-brand-text hover:underline'

/** Light-grey footer in the Booking style: bold column headings, plain links, a quiet last line. */
export const Footer = () => {
  const whatsappUrl = useGeneralWhatsAppUrl()

  return (
    <footer className="border-t border-line bg-canvas-alt text-ink">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-10 py-10 sm:py-14 md:grid-cols-3 lg:grid-cols-5">
        <nav aria-label="Support">
          <h2 className={heading}>Support</h2>
          <ul className="space-y-3">
            <li>
              <Link to="/contact" className={linkClass}>
                Contact us
              </Link>
            </li>
            <li>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Chat on WhatsApp
              </a>
            </li>
            <li>
              <a href={`tel:${contact.phoneTel}`} className={linkClass}>
                Call us
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contactEmail}`} className={linkClass}>
                Email us
              </a>
            </li>
          </ul>
        </nav>

        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className={heading}>{group.title}</h2>
            <ul className="space-y-3">
              {group.links.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-line">
        <Container className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className={heading}>Phone</p>
            <a href={`tel:${contact.phoneTel}`} className={linkClass}>
              {contact.phoneDisplay}
            </a>
          </div>
          <div>
            <p className={heading}>Email</p>
            <a href={`mailto:${site.contactEmail}`} className={`${linkClass} break-all`}>
              {site.contactEmail}
            </a>
          </div>
          <div>
            <p className={heading}>Office</p>
            <address className="text-base text-ink not-italic">{site.office.lines.slice(0, 2).join(', ')}</address>
          </div>
          <div>
            <p className={heading}>Hours</p>
            <p className="text-base text-ink">{site.supportHours}</p>
          </div>
        </Container>
      </div>

      <div className="border-t border-line">
        <Container className="flex flex-col items-center gap-4 py-8 text-center">
          <Logo />
          <p className="max-w-xl text-sm text-ink-soft">
            {site.tagline}. {site.description}
          </p>
          {activeSocialLinks.length > 0 && (
            <ul className="flex gap-3" aria-label={`${site.name} on social media`}>
              {activeSocialLinks.map((link) => (
                <li key={link.platform}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label}: ${link.handle}`}
                    className="flex size-10 items-center justify-center rounded-lg border border-line bg-white text-ink transition-colors duration-200 hover:border-brand hover:text-brand-text"
                  >
                    <SocialIcon platform={link.platform} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm text-muted">
            Copyright &copy; {currentYear} {site.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  )
}
