import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { ReactNode } from 'react'

import { SocialIcon, WhatsAppIcon } from '@/components/common/BrandIcons'
import { PageHeader } from '@/components/common/PageHeader'
import { SeoHead } from '@/components/common/SeoHead'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Card } from '@/components/ui/Card'
import { contact } from '@/data/contact'
import { site } from '@/data/site'
import { activeSocialLinks } from '@/data/social'
import { EnquiryForm } from '@/features/enquiry/components/EnquiryForm'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'

const Row = ({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) => (
  <li className="flex gap-4">
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-saffron-soft text-saffron-dark">
      {icon}
    </span>
    <div>
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <div className="font-medium text-indigo">{children}</div>
    </div>
  </li>
)

export const ContactPage = () => {
  const whatsappUrl = useGeneralWhatsAppUrl()

  return (
    <>
      <SeoHead
        title="Contact us"
        description="Talk to the VaranasiTrails team on WhatsApp, phone or email, or send us an enquiry and we will reply within hours."
        path="/contact"
      />
      <PageHeader
        eyebrow="Get in touch"
        title="Let us plan your trip"
        subtitle="The fastest way to reach us is WhatsApp. Prefer email or a call? That works too."
      />

      <Container className="grid gap-10 py-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-8">
          <ButtonLink href={whatsappUrl} variant="whatsapp" size="lg" className="w-full sm:w-auto">
            <WhatsAppIcon className="size-5" />
            Chat on WhatsApp
          </ButtonLink>

          <ul className="space-y-6">
            <Row icon={<Phone className="size-5" aria-hidden="true" />} label="Phone">
              <a href={`tel:${contact.phoneTel}`} className="hover:underline">
                {contact.phoneDisplay}
              </a>
            </Row>
            <Row icon={<Mail className="size-5" aria-hidden="true" />} label="Email">
              <a href={`mailto:${site.contactEmail}`} className="hover:underline">
                {site.contactEmail}
              </a>
            </Row>
            <Row icon={<MapPin className="size-5" aria-hidden="true" />} label="Office">
              <address className="not-italic">
                {site.office.name}
                {site.office.lines.map((line) => (
                  <span key={line} className="block font-normal text-muted">
                    {line}
                  </span>
                ))}
              </address>
            </Row>
            <Row icon={<Clock className="size-5" aria-hidden="true" />} label="Support hours">
              {site.supportHours}
            </Row>
          </ul>

          <div>
            <h2 className="mb-3 font-sans text-sm font-semibold tracking-wide text-muted uppercase">Follow us</h2>
            <ul className="flex gap-3">
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
        </div>

        <Card className="p-6 sm:p-8">
          <h2 className="text-2xl">Send us an enquiry</h2>
          <p className="mt-1 mb-6 text-muted">Tell us your dates and who is travelling. We reply within a few hours.</p>
          <EnquiryForm />
        </Card>
      </Container>
    </>
  )
}
