import LandingNav from "@/components/landing-page/LandingNav";
import LandingFooter from "@/components/landing-page/LandingFooter";
import AboutHero from "@/components/about/AboutHero";
import AboutValues from "@/components/about/AboutValues";
import AboutStats from "@/components/about/AboutStats";
import AboutMissionVision from "@/components/about/AboutMissionVision";
import AboutCTA from "@/components/about/AboutCTA";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      <LandingNav />
      <AboutHero />
      <AboutValues />
      <AboutStats />
      <AboutMissionVision />
      <AboutCTA />
      <LandingFooter />
    </main>
  );
}