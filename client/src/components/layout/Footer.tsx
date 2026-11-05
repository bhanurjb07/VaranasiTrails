import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router'

import { SocialIcon } from '@/components/common/BrandIcons'
import { contact } from '@/data/contact'
import { footerGroups } from '@/data/navigation'
import { site } from '@/data/site'
import { activeSocialLinks } from '@/data/social'
import { Container } from './Container'
import { Logo } from './Logo'

const currentYear = new Date().getFullYear()

export const Footer = () => (
  <footer className="mt-24 bg-indigo text-white/80">
    <Container className="grid gap-12 py-16 lg:grid-cols-[1.4fr_2fr]">
      <div>
        <Logo invert />
        <p className="mt-4 max-w-sm text-white/70">{site.tagline}. {site.description}</p>

        <ul className="mt-6 flex gap-3" aria-label={`${site.name} on social media`}>
          {activeSocialLinks.map((link) => (
            <li key={link.platform}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.label}: ${link.handle}`}
                className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-saffron hover:text-indigo"
              >
                <SocialIcon platform={link.platform} className="size-5" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-10 sm:grid-cols-3">
        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-4 font-sans text-sm font-semibold tracking-wider text-gold uppercase">{group.title}</h2>
            <ul className="space-y-2.5">
              {group.links.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className="text-white/75 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </Container>

    <div className="border-t border-white/10">
      <Container className="flex flex-col gap-6 py-8 text-sm lg:flex-row lg:items-center lg:justify-between">
        <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
          <li className="flex items-center gap-2">
            <Phone className="size-4 text-gold" aria-hidden="true" />
            <a href={`tel:${contact.phoneTel}`} className="hover:text-white">
              {contact.phoneDisplay}
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Mail className="size-4 text-gold" aria-hidden="true" />
            <a href={`mailto:${site.contactEmail}`} className="hover:text-white">
              {site.contactEmail}
            </a>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-4 text-gold" aria-hidden="true" />
            <span>{site.office.lines.slice(0, 2).join(', ')}</span>
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-4 text-gold" aria-hidden="true" />
            <span>{site.supportHours}</span>
          </li>
        </ul>
        <p className="text-white/55">
          &copy; {currentYear} {site.name}. All rights reserved.
        </p>
      </Container>
    </div>
  </footer>
)
