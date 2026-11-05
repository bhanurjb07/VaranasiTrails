import { useLocation } from 'react-router'

import { WhatsAppIcon } from '@/components/common/BrandIcons'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'
import { cn } from '@/lib/cn'

export const FloatingWhatsApp = () => {
  const { pathname } = useLocation()
  const url = useGeneralWhatsAppUrl()

  // The trip page has its own sticky WhatsApp bar on phones.
  const onTripPage = /^\/destinations\/[^/]+/.test(pathname)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        'fixed right-5 bottom-5 z-30 flex size-14 items-center justify-center rounded-full bg-whatsapp text-indigo',
        'shadow-lift transition-transform duration-200 hover:scale-110 hover:bg-whatsapp-dark hover:text-white',
        onTripPage && 'max-md:hidden',
      )}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  )
}
