import LandingNav from "@/components/landing-page/LandingNav";
import HeroSection from "@/components/landing-page/HeroSection";
import FeaturesSection from "@/components/landing-page/FeaturesSection";
import WorkflowSection from "@/components/landing-page/WorkflowSection";
import TrustedSection from "@/components/landing-page/TrustedSection";
import CTASection from "@/components/landing-page/CTASection";
import LandingFooter from "@/components/landing-page/LandingFooter";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <TrustedSection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
