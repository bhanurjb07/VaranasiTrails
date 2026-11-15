import { MessageCircle } from 'lucide-react'

import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'

/**
 * Chat button fixed to the bottom right: a green circle with a speech bubble, a soft halo and a
 * slow ripple that repeats. Desktop and tablet only. Phones have a WhatsApp button in the header
 * and a booking bar on trip pages.
 */
export const FloatingWhatsApp = () => {
  const url = useGeneralWhatsAppUrl()

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed right-5 bottom-5 z-30 flex size-[4.5rem] items-center justify-center rounded-full focus-visible:outline-none max-md:hidden"
    >
      <span className="absolute inset-0 rounded-full bg-whatsapp/15" aria-hidden="true" />
      <span className="animate-ripple absolute inset-2 rounded-full bg-whatsapp" aria-hidden="true" />
      <span className="relative flex size-14 items-center justify-center rounded-full bg-whatsapp text-night shadow-lift transition-[transform,background-color,box-shadow] duration-300 group-hover:scale-105 group-hover:bg-whatsapp-dark group-focus-visible:ring-4 group-focus-visible:ring-whatsapp/40">
        <MessageCircle className="size-7" strokeWidth={2} aria-hidden="true" />
      </span>
    </a>
  )
}
