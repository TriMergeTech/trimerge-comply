"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0f2b] border-b border-white/10 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="TriMerge Comply"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <div className="leading-none">
            <span className="text-white font-bold text-lg block leading-tight">TriMerge</span>
            <span className="text-[#818cf8] font-bold text-xs tracking-widest uppercase">COMPLY</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {["Product", "Solutions", "Resources"].map((item) => (
            <button
              key={item}
              className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {item}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          ))}
          <Link href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            About Us
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-white/80 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/request-demo"
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Request Demo
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white/80"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0d0f2b] border-t border-white/10 px-6 py-4 space-y-4">
          {["Product", "Solutions", "Resources", "Pricing"].map((item) => (
            <Link key={item} href="#" className="block text-sm font-medium text-white/70">
              {item}
            </Link>
          ))}
          <Link href="/about" className="block text-sm font-medium text-white/70">
            About Us
          </Link>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/login" className="text-sm font-semibold text-white/80">Log In</Link>
            <Link
              href="/request-demo"
              className="bg-[#4f46e5] text-white text-sm font-semibold px-5 py-2.5 rounded-lg text-center"
            >
              Request Demo
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}