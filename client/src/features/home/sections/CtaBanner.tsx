import { Container } from '@/components/layout/Container'
import { ctaBanner } from '@/data/home'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'

/** A plain navy panel with the invitation and one button, like the "Weekend Deal" offer. */
export const CtaBanner = () => {
  const whatsappUrl = useGeneralWhatsAppUrl()

  return (
    <section className="bg-canvas pt-4 pb-12 sm:pb-16">
      <Container>
        <div className="rounded-lg bg-navy p-6 text-ivory sm:p-10">
          <h2 className="max-w-2xl font-sans text-2xl leading-snug font-bold text-ivory sm:text-3xl">{ctaBanner.title}</h2>
          <p className="mt-2 max-w-xl text-base leading-snug text-ivory/90 sm:text-lg">{ctaBanner.text}</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#25d366] px-6 text-base font-bold text-[#06291a] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#1ebe5a] hover:shadow-lg active:translate-y-0 active:scale-[0.98] sm:w-auto"
          >
            {ctaBanner.button}
          </a>
        </div>
      </Container>
    </section>
  )
}
