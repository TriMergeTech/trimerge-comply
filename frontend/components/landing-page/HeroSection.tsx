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
              href="/login"
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

        {/* Right - Dashboard screenshot mockup */}
        <div className="flex-1 flex justify-center lg:justify-end z-10">
          <div className="relative w-full max-w-[560px]">
            {/* Browser chrome */}
            <div className="bg-[#1e2235] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
              {/* Browser top bar */}
              <div className="bg-[#161929] px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
              </div>
              {/* Dashboard UI inside browser */}
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-white" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
    </section>
  );
}

/* Inline dashboard mockup matching the mockup image exactly */
function DashboardMockup() {
  return (
    <div className="bg-white flex text-[10px] font-sans" style={{ height: 360 }}>
      {/* Sidebar */}
      <div className="bg-[#1a1f6e] w-[110px] flex-shrink-0 p-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
            <span className="text-white text-[7px] font-bold">T</span>
          </div>
          <div>
            <p className="text-white font-bold text-[8px] leading-none">TriMerge</p>
            <p className="text-blue-300 text-[6px] font-bold tracking-wider">COMPLY</p>
          </div>
        </div>
        {["Dashboard", "Audits", "Uploads", "Flags", "Position Analysis", "Pay Equity", "Reports", "Users", "Activity Log", "Settings"].map((item, i) => (
          <div
            key={item}
            className={`px-2 py-1.5 rounded text-[8px] font-medium cursor-pointer ${i === 0 ? "bg-[#4f46e5] text-white" : "text-white/70 hover:text-white"}`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 bg-[#f8f9ff] p-3 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-gray-800 text-[11px]">Dashboard Overview</p>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-200" />
            <div className="text-right">
              <p className="text-gray-800 text-[8px] font-semibold">Sarah Analyst</p>
              <p className="text-gray-400 text-[7px]">Analyst</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: "Total Flags", val: "248", delta: "+12% vs last week" },
            { label: "Pending Review", val: "102", delta: "↓ 5% vs last week" },
            { label: "Confirmed Findings", val: "68", delta: "↑ 8% vs last week" },
            { label: "High Severity", val: "23", delta: "↑ 15% vs last week" },
          ].map(({ label, val, delta }) => (
            <div key={label} className="bg-white rounded-lg p-2 border border-gray-100">
              <p className="text-gray-500 text-[7px] mb-0.5">{label}</p>
              <p className="text-gray-900 font-bold text-[13px] leading-none">{val}</p>
              <p className="text-gray-400 text-[6px] mt-0.5">{delta}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Flags by Engine */}
          <div className="bg-white rounded-lg p-2 border border-gray-100">
            <p className="text-gray-700 font-semibold text-[8px] mb-2">Flags by Engine</p>
            <div className="flex items-center gap-2">
              {/* Donut */}
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="13" fill="none" stroke="#f0f0f0" strokeWidth="5" />
                  <circle cx="18" cy="18" r="13" fill="none" stroke="#4f46e5" strokeWidth="5"
                    strokeDasharray="51 31" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="13" fill="none" stroke="#22d3ee" strokeWidth="5"
                    strokeDasharray="21 61" strokeDashoffset="-51" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="13" fill="none" stroke="#f97316" strokeWidth="5"
                    strokeDasharray="10 72" strokeDashoffset="-72" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-gray-700">248</span>
                </div>
              </div>
              <div className="space-y-0.5">
                {[
                  { color: "#4f46e5", label: "Adverse Impact", pct: "104 (62%)" },
                  { color: "#22d3ee", label: "Pay Equity", pct: "79 (21%)" },
                  { color: "#f97316", label: "Position Descr.", pct: "65 (17%)" },
                ].map(({ color, label, pct }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-[6px] text-gray-600">{label}</span>
                    <span className="text-[6px] text-gray-400">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Flags by Severity */}
          <div className="bg-white rounded-lg p-2 border border-gray-100">
            <p className="text-gray-700 font-semibold text-[8px] mb-2">Flags by Severity</p>
            <div className="flex items-center gap-2">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="13" fill="none" stroke="#f0f0f0" strokeWidth="5" />
                  <circle cx="18" cy="18" r="13" fill="none" stroke="#ef4444" strokeWidth="5"
                    strokeDasharray="10 72" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="13" fill="none" stroke="#f97316" strokeWidth="5"
                    strokeDasharray="19 63" strokeDashoffset="-10" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="13" fill="none" stroke="#eab308" strokeWidth="5"
                    strokeDasharray="28 54" strokeDashoffset="-29" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="13" fill="none" stroke="#22c55e" strokeWidth="5"
                    strokeDasharray="15 67" strokeDashoffset="-57" strokeLinecap="round" />
                </svg>
              </div>
              <div className="space-y-0.5">
                {[
                  { color: "#ef4444", label: "Critical", val: "33 (9%)" },
                  { color: "#f97316", label: "High", val: "68 (27%)" },
                  { color: "#eab308", label: "Medium", val: "102 (41%)" },
                  { color: "#22c55e", label: "Low", val: "55 (23%)" },
                ].map(({ color, label, val }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-[6px] text-gray-600">{label}</span>
                    <span className="text-[6px] text-gray-400">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-2 border border-gray-100">
          <p className="text-gray-700 font-semibold text-[8px] mb-2">Recent Activity</p>
          <div className="space-y-1.5">
            {[
              { title: "New applicant data uploaded", sub: "City of Springfield Audit", time: "May 21, 2024  10:30 AM", badge: "Upload Successful", color: "bg-green-100 text-green-700" },
              { title: "Pay equity analysis completed", sub: "Public Health Dept Audit", time: "May 21, 2024  09:15 AM", badge: "Analysis Completed", color: "bg-blue-100 text-blue-700" },
              { title: "3 Flags require your review", sub: "State Transit Authority Audit", time: "May 20, 2024  04:45 PM", badge: "Pending Review", color: "bg-orange-100 text-orange-700" },
            ].map(({ title, sub, time, badge, color }) => (
              <div key={title} className="flex items-center justify-between py-0.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-gray-800 text-[7.5px] font-medium">{title}</p>
                  <p className="text-gray-400 text-[6.5px]">{sub}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-400 text-[6px]">{time}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[6px] font-medium ${color}`}>{badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}