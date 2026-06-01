"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Shield, Menu, X } from "lucide-react";

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a1f6e] rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="leading-none">
            <span className="text-[#1a1f6e] font-bold text-lg block leading-tight">TriMerge</span>
            <span className="text-[#4f46e5] font-bold text-xs tracking-widest uppercase">COMPLY</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {["Product", "Solutions", "Resources"].map((item) => (
            <button
              key={item}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-[#4f46e5] transition-colors"
            >
              {item}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          ))}
          <Link href="#" className="text-sm font-medium text-gray-700 hover:text-[#4f46e5] transition-colors">
            Pricing
          </Link>
          <Link href="#" className="text-sm font-medium text-gray-700 hover:text-[#4f46e5] transition-colors">
            About Us
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-gray-800 hover:text-[#4f46e5] transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/login"
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Request Demo
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4">
          {["Product", "Solutions", "Resources", "Pricing", "About Us"].map((item) => (
            <Link key={item} href="#" className="block text-sm font-medium text-gray-700">
              {item}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/login" className="text-sm font-semibold text-gray-800">Log In</Link>
            <Link href="/login" className="bg-[#4f46e5] text-white text-sm font-semibold px-5 py-2.5 rounded-lg text-center">
              Request Demo
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}