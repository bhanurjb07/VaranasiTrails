import { WhatsAppIcon } from '@/components/common/BrandIcons'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'

/**
 * Round WhatsApp-green button fixed to the bottom right, with two soft rings that ripple
 * outwards. Desktop and tablet only: phones have a WhatsApp button in the header and a
 * booking bar on trip pages.
 */
export const FloatingWhatsApp = () => {
  const url = useGeneralWhatsAppUrl()

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="animate-wa-glow group fixed right-6 bottom-6 z-30 grid size-14 place-items-center rounded-full bg-[#25d366] text-white transition-[transform,background-color] duration-200 ease-out hover:-translate-y-1 hover:scale-110 hover:bg-[#1ebe5a] active:scale-95 max-md:hidden"
    >
      <span className="animate-wa-ring pointer-events-none absolute inset-0 rounded-full bg-[#25d366]" aria-hidden="true" />
      <span className="animate-wa-ring pointer-events-none absolute inset-0 rounded-full bg-[#25d366] [animation-delay:1.2s]" aria-hidden="true" />
      <WhatsAppIcon className="relative size-8 transition-transform duration-300 group-hover:rotate-[-8deg]" />
    </a>
  )
}
