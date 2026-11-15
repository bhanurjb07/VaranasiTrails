import { ChevronDown, Mail, Phone } from 'lucide-react'
import { useId, useState } from 'react'

import { SocialIcon } from '@/components/common/BrandIcons'
import { Card } from '@/components/ui/Card'
import type { Founder } from '@/data/founder'
import { cn } from '@/lib/cn'
import { formatPhone } from '@/lib/format'

/** Only web links are used for the social buttons. Anything else is dropped. */
const webUrl = (value: string): string | null => {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

const iconButton =
  'flex size-11 items-center justify-center rounded-control bg-indigo text-white transition-colors hover:bg-saffron hover:text-indigo'

export const FounderCard = ({ founder, priority = false }: { founder: Founder; priority?: boolean }) => {
  const [expanded, setExpanded] = useState(false)
  const moreId = useId()

  const instagram = webUrl(founder.instagram)
  const facebook = webUrl(founder.facebook)
  const phone = founder.phone.trim()
  const email = founder.email.trim()
  const hasContact = Boolean(instagram || facebook || phone || email)
  const hasMore = founder.fullIntro.length > 0

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <img
        src={founder.photo}
        alt={founder.photoAlt}
        width={2234}
        height={2115}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="aspect-[4/3] w-full object-cover object-top sm:aspect-square"
      />

      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <p className="text-xs font-semibold tracking-[0.18em] text-saffron-dark uppercase">{founder.role}</p>
        <h2 className="mt-1 text-3xl">{founder.name}</h2>
        <p className="mt-3 text-lg text-ink/90">{founder.shortIntro}</p>

        {hasMore && (
          <>
            <div id={moreId} hidden={!expanded} className="mt-4 space-y-3 text-ink/90">
              {founder.fullIntro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={moreId}
              onClick={() => setExpanded((value) => !value)}
              className="mt-4 inline-flex items-center gap-1.5 self-start font-semibold text-saffron-dark hover:underline"
            >
              {expanded ? 'Show less' : 'Know more'}
              <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
            </button>
          </>
        )}

        {hasContact && (
          <div className="mt-6 border-t border-line pt-5">
            {(phone || email) && (
              <ul className="space-y-2.5 text-ink">
                {phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="size-5 shrink-0 text-saffron-dark" aria-hidden="true" />
                    <a href={`tel:${phone}`} className="hover:underline">
                      {formatPhone(phone)}
                    </a>
                  </li>
                )}
                {email && (
                  <li className="flex min-w-0 items-center gap-3">
                    <Mail className="size-5 shrink-0 text-saffron-dark" aria-hidden="true" />
                    <a href={`mailto:${email}`} className="min-w-0 break-all hover:underline">
                      {email}
                    </a>
                  </li>
                )}
              </ul>
            )}

            {(instagram || facebook) && (
              <ul className={cn('flex gap-3', (phone || email) && 'mt-4')} aria-label={`${founder.name} on social media`}>
                {instagram && (
                  <li>
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${founder.name} on Instagram`}
                      className={iconButton}
                    >
                      <SocialIcon platform="instagram" className="size-5" />
                    </a>
                  </li>
                )}
                {facebook && (
                  <li>
                    <a
                      href={facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${founder.name} on Facebook`}
                      className={iconButton}
                    >
                      <SocialIcon platform="facebook" className="size-5" />
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
