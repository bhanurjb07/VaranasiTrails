import { SeoHead } from '@/components/common/SeoHead'
import { Categories } from '@/features/home/sections/Categories'
import { CategoryRail } from '@/features/home/sections/CategoryRail'
import { CtaBanner } from '@/features/home/sections/CtaBanner'
import { Faq } from '@/features/home/sections/Faq'
import { FeaturedTrips } from '@/features/home/sections/FeaturedTrips'
import { Hero } from '@/features/home/sections/Hero'
import { Offers } from '@/features/home/sections/Offers'
import { HowItWorks } from '@/features/home/sections/HowItWorks'
import { WhyUs } from '@/features/home/sections/WhyUs'

export const HomePage = () => (
  <>
    <SeoHead path="/" />
    <Hero />
    <WhyUs />
    <Offers />
    <CategoryRail />
    <FeaturedTrips />
    <Categories />
    <HowItWorks />
    <Faq />
    <CtaBanner />
  </>
)
