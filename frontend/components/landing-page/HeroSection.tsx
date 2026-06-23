import Link from "next/link";
import Image from "next/image";
import { Bot, BadgeCheck, Lock, Users } from "lucide-react";

const trustBadges = [
  { icon: Bot, label: "AI-Powered", sub: "Analysis" },
  { icon: BadgeCheck, label: "Statistically", sub: "Validated" },
  { icon: Lock, label: "Secure &", sub: "Compliant" },
  { icon: Users, label: "Built for HR &", sub: "Compliance Teams" },
];

export default function HeroSection() {
  return (
    <section className="bg-[#0d0f2b] pt-16 min-h-[540px] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center gap-10">
        {/* Left copy */}
        <div className="flex-1 text-white z-10">
          <span className="inline-flex items-center gap-2 border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            AI-POWERED HR COMPLIANCE AUDITS
          </span>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 text-white">
            Find Risks Before<br />They Become Problems
          </h1>

          <p className="text-white/70 text-base leading-relaxed mb-8 max-w-md">
            TriMerge Comply helps organizations and agencies identify hiring,
            pay equity, and job description risks with AI-powered analysis and
            expert-backed insights.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Link
              href="/request-demo"
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              Request Demo →
            </Link>
            <Link
              href="/dashboard"
              className="border border-white/30 hover:border-white/60 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
            >
              Explore Platform
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6">
            {trustBadges.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white/80" />
                </div>
                <div className="leading-none">
                  <p className="text-white/90 text-xs font-semibold">{label}</p>
                  <p className="text-white/60 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Dashboard screenshot */}
        <div className="flex-1 flex justify-center lg:justify-end z-10">
          <div className="relative w-full max-w-[560px]">
            {/* Glow halo behind device */}
            <div className="absolute -inset-6 bg-indigo-500/20 rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-white/10">
              <Image
                src="/dashboard-screenshot.png"
                alt="TriMerge Comply dashboard"
                width={1120}
                height={720}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
