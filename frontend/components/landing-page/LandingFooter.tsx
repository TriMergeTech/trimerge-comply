import Link from "next/link";
import { Shield } from "lucide-react";

const footerLinks = ["Product", "Solutions", "Resources", "About Us", "Contact", "Privacy Policy", "Terms of Service"];

export default function LandingFooter() {
  return (
    <footer className="bg-[#0a0c22] border-t border-white/5 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#4f46e5] rounded-lg flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm">TriMerge</span>
            <span className="text-[#4f46e5] font-bold text-xs tracking-widest uppercase ml-1">COMPLY</span>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-5">
          {footerLinks.map((link) => (
            <Link
              key={link}
              href="#"
              className="text-white/50 hover:text-white/80 text-xs transition-colors"
            >
              {link}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-white/30 text-xs">© 2024 TriMerge Comply. All rights reserved.</p>
      </div>
    </footer>
  );
}