'use client'

import { useState } from 'react'
import LandingNav from '@/components/landing-page/LandingNav'
import PricingHero from '@/components/pricing/PricingHero'
import PricingCards from '@/components/pricing/PricingCards'
import TrustedSection from '@/components/landing-page/TrustedSection'
import PricingBottom from '@/components/pricing/PricingBottom'
import LandingFooter from '@/components/landing-page/LandingFooter'

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true)

  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <PricingHero isYearly={isYearly} onToggle={() => setIsYearly(!isYearly)} />
      <PricingCards isYearly={isYearly} />
      <TrustedSection />
      <PricingBottom />
      <LandingFooter />
    </div>
  )
}
