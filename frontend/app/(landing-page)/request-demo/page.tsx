import LandingNav from '@/components/landing-page/LandingNav'
import RequestDemoHero from '@/components/request-demo/RequestDemoHero'
import RequestDemoForm from '@/components/request-demo/RequestDemoForm'
import TrustedSection from '@/components/landing-page/TrustedSection'
import RequestDemoInfo from '@/components/landing-page/RequestDemoInfo'

export default function RequestDemoPage() {
  return (
    <div className="min-h-screen bg-[#f5f6fb]">
      <LandingNav />
      <div className="pt-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <RequestDemoHero />
          <RequestDemoForm />
        </div>
      </div>
      <TrustedSection />
      <RequestDemoInfo />
    </div>
  )
}
