import { SeoHead } from '@/components/common/SeoHead'
import { site } from '@/data/site'
import {
  AboutClosing,
  AboutExperiences,
  AboutHero,
  AboutPlaces,
  AboutPrinciples,
  AboutStory,
} from '@/features/about/AboutSections'
import { useGeneralWhatsAppUrl } from '@/features/enquiry/hooks/useWhatsAppUrl'

export const AboutPage = () => {
  const whatsappUrl = useGeneralWhatsAppUrl()

  return (
    <>
      <SeoHead
        title="About us"
        description={`${site.name} plans guided trips in Varanasi, Sarnath and Uttar Pradesh.`}
        path="/about"
      />
      <AboutHero />
      <AboutStory />
      <AboutExperiences />
      <AboutPlaces />
      <AboutPrinciples />
      <AboutClosing whatsappUrl={whatsappUrl} />
    </>
  )
}
