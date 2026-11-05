import { useAuth } from '@/features/auth/useAuth'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

/** WhatsApp link for the general enquiry template, personalised when logged in. */
export const useGeneralWhatsAppUrl = (): string => {
  const { user } = useAuth()
  return buildWhatsAppUrl('generalEnquiry', { name: user?.name })
}
