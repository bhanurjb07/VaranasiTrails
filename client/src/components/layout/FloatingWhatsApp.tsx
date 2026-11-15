import { WhatsAppIcon } from '@/components/common/BrandIcons'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'

/** Desktop and tablet only. Phones have a WhatsApp button in the header and a booking bar on trip pages. */
export const FloatingWhatsApp = () => {
  const url = useGeneralWhatsAppUrl()

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-5 bottom-5 z-30 flex size-14 items-center justify-center rounded-control bg-whatsapp text-indigo shadow-lift transition-colors duration-200 hover:bg-whatsapp-dark hover:text-white max-md:hidden"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  )
}
