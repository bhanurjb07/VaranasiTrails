import { WhatsAppIcon } from '@/components/common/BrandIcons'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ctaBanner } from '@/data/home'
import { placeholderImages } from '@/data/placeholderMedia'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'

export const CtaBanner = () => {
  const whatsappUrl = useGeneralWhatsAppUrl()
  const image = placeholderImages.gangaAarti

  return (
    <section className="py-8 sm:py-20 md:py-28">
      <Container>
        <div className="reveal relative isolate overflow-hidden rounded-[1.75rem] bg-night px-6 py-16 text-center sm:px-16 sm:py-20">
          <ImageWithFallback
            src={image.url}
            alt=""
            sizes="100vw"
            className="absolute inset-0 -z-20 size-full opacity-45"
          />
          <div className="bg-dusk absolute inset-0 -z-10 opacity-85" />
          <h2 className="text-balance text-4xl text-white sm:text-5xl">{ctaBanner.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{ctaBanner.text}</p>
          <ButtonLink href={whatsappUrl} variant="whatsapp" size="lg" className="mt-8">
            <WhatsAppIcon className="size-5" />
            {ctaBanner.button}
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
