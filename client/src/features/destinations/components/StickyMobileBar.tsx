import { WhatsAppIcon } from '@/components/common/BrandIcons'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { formatPrice } from '@/lib/format'

interface StickyMobileBarProps {
  priceInr: number
  originalPriceInr: number | null
  whatsappUrl: string
}

/** Phone-only bottom bar so the price and booking action are always one tap away. */
export const StickyMobileBar = ({ priceInr, originalPriceInr, whatsappUrl }: StickyMobileBarProps) => (
  <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-3 shadow-lift backdrop-blur lg:hidden">
    <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
      <div>
        <p className="text-xs text-muted">From</p>
        <p className="flex items-baseline gap-2">
          <span className="font-heading text-2xl font-semibold text-indigo">{formatPrice(priceInr)}</span>
          {originalPriceInr && originalPriceInr > priceInr && (
            <span className="text-sm text-muted line-through">{formatPrice(originalPriceInr)}</span>
          )}
        </p>
      </div>
      <ButtonLink href={whatsappUrl} variant="whatsapp" size="md">
        <WhatsAppIcon className="size-5" />
        Book on WhatsApp
      </ButtonLink>
    </div>
  </div>
)
