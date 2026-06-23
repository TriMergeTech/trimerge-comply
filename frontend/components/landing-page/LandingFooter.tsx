import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { label: "Product",          href: "#" },
  { label: "Solutions",        href: "#" },
  { label: "Resources",        href: "#" },
  { label: "About Us",         href: "/about" },
  { label: "Contact",          href: "#" },
  { label: "Privacy Policy",   href: "/terms#data-privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function LandingFooter() {
  return (
    <footer className="bg-[#0a0c22] border-t border-white/5 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="TriMerge Comply"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <div className="leading-none">
            <span className="text-white font-bold text-sm block leading-tight">TriMerge</span>
            <span className="text-[#818cf8] font-bold text-xs tracking-widest uppercase">COMPLY</span>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-5">
          {footerLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-white/50 hover:text-white/80 text-xs transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-white/30 text-xs">© 2026 TriMerge Comply. All rights reserved.</p>
      </div>
    </footer>
  );
}