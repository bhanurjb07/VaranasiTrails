import { SeoHead } from '@/components/common/SeoHead'
import { Categories } from '@/features/home/sections/Categories'
import { CtaBanner } from '@/features/home/sections/CtaBanner'
import { Faq } from '@/features/home/sections/Faq'
import { FeaturedTrips } from '@/features/home/sections/FeaturedTrips'
import { Hero } from '@/features/home/sections/Hero'
import { HowItWorks } from '@/features/home/sections/HowItWorks'
import { Stats } from '@/features/home/sections/Stats'
import { Testimonials } from '@/features/home/sections/Testimonials'
import { WhyUs } from '@/features/home/sections/WhyUs'

export const HomePage = () => (
  <>
    <SeoHead path="/" />
    <Hero />
    <FeaturedTrips />
    <Categories />
    <HowItWorks />
    <WhyUs />
    <Stats />
    <Testimonials />
    <Faq />
    <CtaBanner />
  </>
)
