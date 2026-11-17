import { MessageCircle } from 'lucide-react'

import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'

/**
 * Small chat button fixed to the bottom right. Desktop and tablet only: phones have a
 * WhatsApp button in the header and a booking bar on trip pages.
 */
export const FloatingWhatsApp = () => {
  const url = useGeneralWhatsAppUrl()

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-6 bottom-6 z-30 flex size-12 items-center justify-center rounded-control border border-ivory/15 bg-brand text-ivory transition-colors duration-500 ease-out hover:bg-brand-deep max-md:hidden"
    >
      <MessageCircle className="size-5" aria-hidden="true" />
    </a>
  )
}
